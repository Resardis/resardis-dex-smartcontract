/// matching_market.sol
// Copyright (C) 2017 - 2020 Maker Ecosystem Growth Holdings, INC.

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

pragma solidity ^0.5.17;

import "./MarketExpiring.sol";
import "../vendor/dapphub/DSNote.sol";

contract MatchingEvents {
    event LogBuyEnabled(bool isEnabled);
    event LogMinSell(address payGem, uint256 minAmount);
    event LogMatchingEnabled(bool isEnabled);
    event LogUnsortedOffer(uint256 id);
    event LogSortedOffer(uint256 id);
    event LogInsert(address keeper, uint256 id);
    event LogDelete(address keeper, uint256 id);
}

contract MatchingMarket is MatchingEvents, ExpiringMarket, DSNote {
    bool public buyEnabled = true; //buy enabled
    bool public matchingEnabled = true; //true: enable matching,
    //false: revert to expiring market
    struct sortInfo {
        uint256 next; //points to id of next higher offer
        uint256 prev; //points to id of previous lower offer
        uint256 delb; //the blocknumber where this entry was marked for delete
    }
    //doubly linked lists of sorted offer ids
    mapping(uint256 => sortInfo) public _rank;
    //id of the highest offer for a token pair
    mapping(address => mapping(address => uint256)) public _best;
    //number of offers stored for token pair in sorted orderbook
    mapping(address => mapping(address => uint256)) public _span;
    //minimum sell amount for a token to avoid dust offers
    mapping(address => uint256) public _dust;
    //next unsorted offer id
    mapping(uint256 => uint256) public _near;
    //first unsorted offer id
    uint256 public _head;
    // id of the latest offer marked as dust
    uint256 public dustId;

    // After close, anyone can cancel an offer
    modifier can_cancel(uint256 id) {
        require(isActive(id), "Offer was deleted or taken, or never existed.");
        require(
            isClosed() || msg.sender == getOwner(id) || id == dustId,
            "Offer can not be cancelled because user is not owner, and market is open, and offer sells required amount of tokens."
        );
        _;
    }

    // ---- Public entrypoints ---- //

    function make(
        address payGem,
        address buyGem,
        uint128 payAmt,
        uint128 buyAmt
    ) public returns (bytes32) {
        return bytes32(offer(payAmt, payGem, buyAmt, buyGem));
    }

    function take(bytes32 id, uint128 maxTakeAmount) public {
        require(buy(uint256(id), maxTakeAmount));
    }

    function kill(bytes32 id) public {
        require(cancel(uint256(id)));
    }

    // Make a new offer. Takes funds from the caller into market escrow.
    //
    // If matching is enabled:
    //     * creates new offer without putting it in
    //       the sorted list.
    //     * available to authorized contracts only!
    //     * keepers should call insert(id,pos)
    //       to put offer in the sorted list.
    //
    // If matching is disabled:
    //     * calls expiring market's offer().
    //     * available to everyone without authorization.
    //     * no sorting is done.
    //
    function offer(
        uint256 payAmt, //maker (ask) sell how much
        address payGem, //maker (ask) sell which token
        uint256 buyAmt, //taker (ask) buy how much
        address buyGem //taker (ask) buy which token
    ) public returns (uint256) {
        require(!_locked, "Reentrancy attempt");


            function(uint256, address, uint256, address) returns (uint256) fn
         = matchingEnabled ? _offeru : super.offer;
        return fn(payAmt, payGem, buyAmt, buyGem);
    }

    // Make a new offer. Takes funds from the caller into market escrow.
    function offer(
        uint256 payAmt, //maker (ask) sell how much
        address payGem, //maker (ask) sell which token
        uint256 buyAmt, //maker (ask) buy how much
        address buyGem, //maker (ask) buy which token
        uint256 pos //position to insert offer, 0 should be used if unknown
    ) public can_offer returns (uint256) {
        return offer(payAmt, payGem, buyAmt, buyGem, pos, true);
    }

    function offer(
        uint256 payAmt, //maker (ask) sell how much
        address payGem, //maker (ask) sell which token
        uint256 buyAmt, //maker (ask) buy how much
        address buyGem, //maker (ask) buy which token
        uint256 pos, //position to insert offer, 0 should be used if unknown
        bool rounding //match "close enough" orders?
    ) public can_offer returns (uint256) {
        require(!_locked, "Reentrancy attempt");
        require(_dust[address(payGem)] <= payAmt);

        if (matchingEnabled) {
            return _matcho(payAmt, payGem, buyAmt, buyGem, pos, rounding);
        }
        return super.offer(payAmt, payGem, buyAmt, buyGem);
    }

    //Transfers funds from caller to offer maker, and from market to caller.
    function buy(uint256 id, uint256 amount) public can_buy(id) returns (bool) {
        require(!_locked, "Reentrancy attempt");
        function(uint256, uint256) returns (bool) fn = matchingEnabled
            ? _buys
            : super.buy;
        return fn(id, amount);
    }

    // Cancel an offer. Refunds offer maker.
    function cancel(uint256 id) public can_cancel(id) returns (bool success) {
        require(!_locked, "Reentrancy attempt");
        if (matchingEnabled) {
            if (isOfferSorted(id)) {
                require(_unsort(id));
            } else {
                require(_hide(id));
            }
        }
        return super.cancel(id); //delete the offer.
    }

    //insert offer into the sorted list
    //keepers need to use this function
    function insert(
        uint256 id, //maker (ask) id
        uint256 pos //position to insert into
    ) public returns (bool) {
        require(!_locked, "Reentrancy attempt");
        require(!isOfferSorted(id)); //make sure offers[id] is not yet sorted
        require(isActive(id)); //make sure offers[id] is active

        _hide(id); //remove offer from unsorted offers list
        _sort(id, pos); //put offer into the sorted offers list
        emit LogInsert(msg.sender, id);
        return true;
    }

    //deletes _rank [id]
    //  Function should be called by keepers.
    function delRank(uint256 id) public returns (bool) {
        require(!_locked, "Reentrancy attempt");
        require(
            !isActive(id) &&
                _rank[id].delb != 0 &&
                _rank[id].delb < block.number - 10
        );
        delete _rank[id];
        emit LogDelete(msg.sender, id);
        return true;
    }

    //set the minimum sell amount for a token
    //    Function is used to avoid "dust offers" that have
    //    very small amount of tokens to sell, and it would
    //    cost more gas to accept the offer, than the value
    //    of tokens received.
    function setMinSell(
        address payGem, //token to assign minimum sell amount to
        uint256 dust //maker (ask) minimum sell amount
    ) public auth note returns (bool) {
        _dust[address(payGem)] = dust;
        emit LogMinSell(address(payGem), dust);
        return true;
    }

    //returns the minimum sell amount for an offer
    function getMinSell(
        address payGem //token for which minimum sell amount is queried
    ) public view returns (uint256) {
        return _dust[address(payGem)];
    }

    //set buy functionality enabled/disabled
    function setBuyEnabled(bool buyEnabled_) public auth returns (bool) {
        buyEnabled = buyEnabled_;
        emit LogBuyEnabled(buyEnabled);
        return true;
    }

    //set matching enabled/disabled
    //    If matchingEnabled true(default), then inserted offers are matched.
    //    Except the ones inserted by contracts, because those end up
    //    in the unsorted list of offers, that must be later sorted by
    //    keepers using insert().
    //    If matchingEnabled is false then MatchingMarket is reverted to ExpiringMarket,
    //    and matching is not done, and sorted lists are disabled.
    function setMatchingEnabled(bool matchingEnabled_)
        public
        auth
        returns (bool)
    {
        matchingEnabled = matchingEnabled_;
        emit LogMatchingEnabled(matchingEnabled);
        return true;
    }

    //return the best offer for a token pair
    //      the best offer is the lowest one if it's an ask,
    //      and highest one if it's a bid offer
    function getBestOffer(address sellGem, address buyGem)
        public
        view
        returns (uint256)
    {
        return _best[address(sellGem)][address(buyGem)];
    }

    //return the next worse offer in the sorted list
    //      the worse offer is the higher one if its an ask,
    //      a lower one if its a bid offer,
    //      and in both cases the newer one if they're equal.
    function getWorseOffer(uint256 id) public view returns (uint256) {
        return _rank[id].prev;
    }

    //return the next better offer in the sorted list
    //      the better offer is in the lower priced one if its an ask,
    //      the next higher priced one if its a bid offer
    //      and in both cases the older one if they're equal.
    function getBetterOffer(uint256 id) public view returns (uint256) {
        return _rank[id].next;
    }

    //return the amount of better offers for a token pair
    function getOfferCount(address sellGem, address buyGem)
        public
        view
        returns (uint256)
    {
        return _span[address(sellGem)][address(buyGem)];
    }

    //get the first unsorted offer that was inserted by a contract
    //      Contracts can't calculate the insertion position of their offer because it is not an O(1) operation.
    //      Their offers get put in the unsorted list of offers.
    //      Keepers can calculate the insertion position offchain and pass it to the insert() function to insert
    //      the unsorted offer into the sorted list. Unsorted offers will not be matched, but can be bought with buy().
    function getFirstUnsortedOffer() public view returns (uint256) {
        return _head;
    }

    //get the next unsorted offer
    //      Can be used to cycle through all the unsorted offers.
    function getNextUnsortedOffer(uint256 id) public view returns (uint256) {
        return _near[id];
    }

    function isOfferSorted(uint256 id) public view returns (bool) {
        return
            _rank[id].next != 0 ||
            _rank[id].prev != 0 ||
            _best[address(offers[id].payGem)][address(offers[id].buyGem)] == id;
    }

    function sellAllAmount(
        address payGem,
        uint256 payAmt,
        address buyGem,
        uint256 minFillAmount
    ) public returns (uint256 fillAmt) {
        require(!_locked, "Reentrancy attempt");
        uint256 offerId;
        while (payAmt > 0) {
            //while there is amount to sell
            offerId = getBestOffer(buyGem, payGem); //Get the best offer for the token pair
            require(offerId != 0); //Fails if there are not more offers

            // There is a chance that payAmt is smaller than 1 wei of the other token
            if (
                payAmt * 1 ether <
                wdiv(offers[offerId].buyAmt, offers[offerId].payAmt)
            ) {
                break; //We consider that all amount is sold
            }
            if (payAmt >= offers[offerId].buyAmt) {
                //If amount to sell is higher or equal than current offer amount to buy
                fillAmt = add(fillAmt, offers[offerId].payAmt); //Add amount bought to acumulator
                payAmt = sub(payAmt, offers[offerId].buyAmt); //Decrease amount to sell
                take(bytes32(offerId), uint128(offers[offerId].payAmt)); //We take the whole offer
            } else {
                // if lower
                uint256 baux = rmul(
                    payAmt * 10**9,
                    rdiv(offers[offerId].payAmt, offers[offerId].buyAmt)
                ) / 10**9;
                fillAmt = add(fillAmt, baux); //Add amount bought to acumulator
                take(bytes32(offerId), uint128(baux)); //We take the portion of the offer that we need
                payAmt = 0; //All amount is sold
            }
        }
        require(fillAmt >= minFillAmount);
    }

    function buyAllAmount(
        address buyGem,
        uint256 buyAmt,
        address payGem,
        uint256 maxFillAmount
    ) public returns (uint256 fillAmt) {
        require(!_locked, "Reentrancy attempt");
        uint256 offerId;
        while (buyAmt > 0) {
            //Meanwhile there is amount to buy
            offerId = getBestOffer(buyGem, payGem); //Get the best offer for the token pair
            require(offerId != 0);

            // There is a chance that buyAmt is smaller than 1 wei of the other token
            if (
                buyAmt * 1 ether <
                wdiv(offers[offerId].payAmt, offers[offerId].buyAmt)
            ) {
                break; //We consider that all amount is sold
            }
            if (buyAmt >= offers[offerId].payAmt) {
                //If amount to buy is higher or equal than current offer amount to sell
                fillAmt = add(fillAmt, offers[offerId].buyAmt); //Add amount sold to acumulator
                buyAmt = sub(buyAmt, offers[offerId].payAmt); //Decrease amount to buy
                take(bytes32(offerId), uint128(offers[offerId].payAmt)); //We take the whole offer
            } else {
                //if lower
                fillAmt = add(
                    fillAmt,
                    rmul(
                        buyAmt * 10**9,
                        rdiv(offers[offerId].buyAmt, offers[offerId].payAmt)
                    ) / 10**9
                ); //Add amount sold to acumulator
                take(bytes32(offerId), uint128(buyAmt)); //We take the portion of the offer that we need
                buyAmt = 0; //All amount is bought
            }
        }
        require(fillAmt <= maxFillAmount);
    }

    function getBuyAmount(
        address buyGem,
        address payGem,
        uint256 payAmt
    ) public view returns (uint256 fillAmt) {
        uint256 offerId = getBestOffer(buyGem, payGem); //Get best offer for the token pair
        while (payAmt > offers[offerId].buyAmt) {
            fillAmt = add(fillAmt, offers[offerId].payAmt); //Add amount to buy accumulator
            payAmt = sub(payAmt, offers[offerId].buyAmt); //Decrease amount to pay
            if (payAmt > 0) {
                //If we still need more offers
                offerId = getWorseOffer(offerId); //We look for the next best offer
                require(offerId != 0); //Fails if there are not enough offers to complete
            }
        }
        fillAmt = add(
            fillAmt,
            rmul(
                payAmt * 10**9,
                rdiv(offers[offerId].payAmt, offers[offerId].buyAmt)
            ) / 10**9
        ); //Add proportional amount of last offer to buy accumulator
    }

    function getPayAmount(
        address payGem,
        address buyGem,
        uint256 buyAmt
    ) public view returns (uint256 fillAmt) {
        uint256 offerId = getBestOffer(buyGem, payGem); //Get best offer for the token pair
        while (buyAmt > offers[offerId].payAmt) {
            fillAmt = add(fillAmt, offers[offerId].buyAmt); //Add amount to pay accumulator
            buyAmt = sub(buyAmt, offers[offerId].payAmt); //Decrease amount to buy
            if (buyAmt > 0) {
                //If we still need more offers
                offerId = getWorseOffer(offerId); //We look for the next best offer
                require(offerId != 0); //Fails if there are not enough offers to complete
            }
        }
        fillAmt = add(
            fillAmt,
            rmul(
                buyAmt * 10**9,
                rdiv(offers[offerId].buyAmt, offers[offerId].payAmt)
            ) / 10**9
        ); //Add proportional amount of last offer to pay accumulator
    }

    // ---- Internal Functions ---- //

    function _buys(uint256 id, uint256 amount) internal returns (bool) {
        require(buyEnabled);
        if (amount == offers[id].payAmt) {
            if (isOfferSorted(id)) {
                //offers[id] must be removed from sorted list because all of it is bought
                _unsort(id);
            } else {
                _hide(id);
            }
        }
        require(super.buy(id, amount));
        // If offer has become dust during buy, we cancel it
        if (
            isActive(id) &&
            offers[id].payAmt < _dust[address(offers[id].payGem)]
        ) {
            dustId = id; //enable current msg.sender to call cancel(id)
            cancel(id);
        }
        return true;
    }

    //find the id of the next higher offer after offers[id]
    function _find(uint256 id) internal view returns (uint256) {
        require(id > 0);

        address buyGem = address(offers[id].buyGem);
        address payGem = address(offers[id].payGem);
        uint256 top = _best[payGem][buyGem];
        uint256 oldTop = 0;

        // Find the larger-than-id order whose successor is less-than-id.
        while (top != 0 && _isPricedLtOrEq(id, top)) {
            oldTop = top;
            top = _rank[top].prev;
        }
        return oldTop;
    }

    //find the id of the next higher offer after offers[id]
    function _findpos(uint256 id, uint256 pos) internal view returns (uint256) {
        require(id > 0);

        // Look for an active order.
        while (pos != 0 && !isActive(pos)) {
            pos = _rank[pos].prev;
        }

        if (pos == 0) {
            //if we got to the end of list without a single active offer
            return _find(id);
        } else {
            // if we did find a nearby active offer
            // Walk the order book down from there...
            if (_isPricedLtOrEq(id, pos)) {
                uint256 oldPos;

                // Guaranteed to run at least once because of
                // the prior if statements.
                while (pos != 0 && _isPricedLtOrEq(id, pos)) {
                    oldPos = pos;
                    pos = _rank[pos].prev;
                }
                return oldPos;

                // ...or walk it up.
            } else {
                while (pos != 0 && !_isPricedLtOrEq(id, pos)) {
                    pos = _rank[pos].next;
                }
                return pos;
            }
        }
    }

    //return true if offers[low] priced less than or equal to offers[high]
    function _isPricedLtOrEq(
        uint256 low, //lower priced offer's id
        uint256 high //higher priced offer's id
    ) internal view returns (bool) {
        return
            mul(offers[low].buyAmt, offers[high].payAmt) >=
            mul(offers[high].buyAmt, offers[low].payAmt);
    }

    //these variables are global only because of solidity local variable limit

    //match offers with taker offer, and execute token transactions
    function _matcho(
        uint256 tPayAmt, //taker sell how much
        address tPayGem, //taker sell which token
        uint256 tBuyAmt, //taker buy how much
        address tBuyGem, //taker buy which token
        uint256 pos, //position id
        bool rounding //match "close enough" orders?
    ) internal returns (uint256 id) {
        uint256 bestMakerId; //highest maker id
        uint256 tBuyAmtOld; //taker buy how much saved
        uint256 mBuyAmt; //maker offer wants to buy this much token
        uint256 mPayAmt; //maker offer wants to sell this much token

        // there is at least one offer stored for token pair
        while (_best[address(tBuyGem)][address(tPayGem)] > 0) {
            bestMakerId = _best[address(tBuyGem)][address(tPayGem)];
            mBuyAmt = offers[bestMakerId].buyAmt;
            mPayAmt = offers[bestMakerId].payAmt;

            // Ugly hack to work around rounding errors. Based on the idea that
            // the furthest the amounts can stray from their "true" values is 1.
            // Ergo the worst case has tPayAmt and mPayAmt at +1 away from
            // their "correct" values and mBuyAmt and tBuyAmt at -1.
            // Since (c - 1) * (d - 1) > (a + 1) * (b + 1) is equivalent to
            // c * d > a * b + a + b + c + d, we write...
            if (
                mul(mBuyAmt, tBuyAmt) >
                mul(tPayAmt, mPayAmt) +
                    (rounding ? mBuyAmt + tBuyAmt + tPayAmt + mPayAmt : 0)
            ) {
                break;
            }
            // ^ The `rounding` parameter is a compromise borne of a couple days
            // of discussion.
            buy(bestMakerId, min(mPayAmt, tBuyAmt));
            tBuyAmtOld = tBuyAmt;
            tBuyAmt = sub(tBuyAmt, min(mPayAmt, tBuyAmt));
            tPayAmt = mul(tBuyAmt, tPayAmt) / tBuyAmtOld;

            if (tPayAmt == 0 || tBuyAmt == 0) {
                break;
            }
        }

        if (tBuyAmt > 0 && tPayAmt > 0 && tPayAmt >= _dust[address(tPayGem)]) {
            //new offer should be created
            id = super.offer(tPayAmt, tPayGem, tBuyAmt, tBuyGem);
            //insert offer into the sorted list
            _sort(id, pos);
        }
    }

    // Make a new offer without putting it in the sorted list.
    // Takes funds from the caller into market escrow.
    // ****Available to authorized contracts only!**********
    // Keepers should call insert(id,pos) to put offer in the sorted list.
    function _offeru(
        uint256 payAmt, //maker (ask) sell how much
        address payGem, //maker (ask) sell which token
        uint256 buyAmt, //maker (ask) buy how much
        address buyGem //maker (ask) buy which token
    ) internal returns (uint256 id) {
        require(_dust[address(payGem)] <= payAmt);
        id = super.offer(payAmt, payGem, buyAmt, buyGem);
        _near[id] = _head;
        _head = id;
        emit LogUnsortedOffer(id);
    }

    //put offer into the sorted list
    function _sort(
        uint256 id, //maker (ask) id
        uint256 pos //position to insert into
    ) internal {
        require(isActive(id));

        address buyGem = offers[id].buyGem;
        address payGem = offers[id].payGem;
        uint256 prevId; //maker (ask) id

        pos = pos == 0 ||
            offers[pos].payGem != payGem ||
            offers[pos].buyGem != buyGem ||
            !isOfferSorted(pos)
            ? _find(id)
            : _findpos(id, pos);

        if (pos != 0) {
            //offers[id] is not the highest offer
            //requirement below is satisfied by statements above
            //require(_isPricedLtOrEq(id, pos));
            prevId = _rank[pos].prev;
            _rank[pos].prev = id;
            _rank[id].next = pos;
        } else {
            //offers[id] is the highest offer
            prevId = _best[address(payGem)][address(buyGem)];
            _best[address(payGem)][address(buyGem)] = id;
        }

        if (prevId != 0) {
            //if lower offer does exist
            //requirement below is satisfied by statements above
            //require(!_isPricedLtOrEq(id, prevId));
            _rank[prevId].next = id;
            _rank[id].prev = prevId;
        }

        _span[address(payGem)][address(buyGem)]++;
        emit LogSortedOffer(id);
    }

    // Remove offer from the sorted list (does not cancel offer)
    function _unsort(
        uint256 id //id of maker (ask) offer to remove from sorted list
    ) internal returns (bool) {
        address buyGem = address(offers[id].buyGem);
        address payGem = address(offers[id].payGem);
        require(_span[payGem][buyGem] > 0);

        require(
            _rank[id].delb == 0 && //assert id is in the sorted list
                isOfferSorted(id)
        );

        if (id != _best[payGem][buyGem]) {
            // offers[id] is not the highest offer
            require(_rank[_rank[id].next].prev == id);
            _rank[_rank[id].next].prev = _rank[id].prev;
        } else {
            //offers[id] is the highest offer
            _best[payGem][buyGem] = _rank[id].prev;
        }

        if (_rank[id].prev != 0) {
            //offers[id] is not the lowest offer
            require(_rank[_rank[id].prev].next == id);
            _rank[_rank[id].prev].next = _rank[id].next;
        }

        _span[payGem][buyGem]--;
        _rank[id].delb = block.number; //mark _rank[id] for deletion
        return true;
    }

    //Hide offer from the unsorted order book (does not cancel offer)
    function _hide(
        uint256 id //id of maker offer to remove from unsorted list
    ) internal returns (bool) {
        uint256 uid = _head; //id of an offer in unsorted offers list
        uint256 pre = uid; //id of previous offer in unsorted offers list

        require(!isOfferSorted(id)); //make sure offer id is not in sorted offers list

        if (_head == id) {
            //check if offer is first offer in unsorted offers list
            _head = _near[id]; //set head to new first unsorted offer
            _near[id] = 0; //delete order from unsorted order list
            return true;
        }
        while (uid > 0 && uid != id) {
            //find offer in unsorted order list
            pre = uid;
            uid = _near[uid];
        }
        if (uid != id) {
            //did not find offer id in unsorted offers list
            return false;
        }
        _near[pre] = _near[id]; //set previous unsorted offer to point to offer after offer id
        _near[id] = 0; //delete order from unsorted order list
        return true;
    }
}
