pragma solidity ^0.5.17;

import "../EternalStorage.sol";
import "../../lib/openzeppelin/IERC20.sol";

contract EventfulMarket {
    event LogItemUpdate(uint256 id);
    event LogTrade(
        uint256 payAmt,
        address indexed payGem,
        uint256 buyAmt,
        address indexed buyGem,
        uint64 indexed timestamp
    );

    event LogMake(
        uint256 indexed id,
        bytes32 indexed pair,
        address indexed maker,
        address payGem,
        address buyGem,
        uint128 payAmt,
        uint128 buyAmt,
        uint64 timestamp,
        uint8 offerType
    );

    event LogTake(
        uint256 id,
        bytes32 indexed pair,
        address indexed maker,
        address payGem,
        address buyGem,
        address indexed taker,
        uint128 takeAmt,
        uint128 giveAmt,
        uint64 timestamp,
        uint8 offerType
    );

    event LogKill(
        uint256 indexed id,
        bytes32 indexed pair,
        address indexed maker,
        address payGem,
        address buyGem,
        uint128 payAmt,
        uint128 buyAmt,
        uint64 timestamp
    );
}

// @TODO: Check contract inheritence in Solidity
// @TODO: DSMath was removed as it is imported in EternalStorage
contract SimpleMarket is EternalStorage, EventfulMarket {
    modifier can_buy(uint256 id) {
        require(isActive(id), _T101);
        _;
    }

    modifier can_cancel(uint256 id) {
        require(isActive(id), _T101);
        require(getOwner(id) == msg.sender, _S101);
        _;
    }

    modifier synchronized {
        require(!_locked, _S102);
        _locked = true;
        _;
        _locked = false;
    }

    function isActive(uint256 id) public view returns (bool active) {
        return offers[id].timestamp > 0;
    }

    function getOwner(uint256 id) public view returns (address owner) {
        return offers[id].owner;
    }

    function getOffer(uint256 id)
        public
        view
        returns (
            uint256,
            address,
            uint256,
            address
        )
    {
        OfferInfo memory offer = offers[id];
        return (offer.payAmt, offer.payGem, offer.buyAmt, offer.buyGem);
    }

    function getIdIndexProcessed(address owner, uint256 id)
        public
        view
        returns (uint256)
    {
        if (offersHistoryIndices[owner][id] == uint256(0)) {
            return offersHistoryIndices[owner][id];
        } else {
            return sub(offersHistoryIndices[owner][id], uint256(1));
        }
    }

    // ---- Public entrypoints ---- //

    // Cancel an offer. Refunds offer maker.
    function cancel(uint256 id)
        public
        can_cancel(id)
        synchronized
        returns (bool success)
    {
        // read-only offer. Modify an offer by directly accessing offers[id]
        OfferInfo memory offer = offers[id];
        delete offers[id];

        tokensInUse[address(offer.payGem)][offer.owner] = sub(
            tokensInUse[address(offer.payGem)][offer.owner],
            offer.payAmt
        );

        uint256 idIndex = getIdIndexProcessed(msg.sender, id);
        offersHistory[msg.sender][idIndex].cancelled = true;

        emit LogItemUpdate(id);
        emit LogKill(
            uint256(id),
            keccak256(abi.encodePacked(offer.payGem, offer.buyGem)),
            offer.owner,
            offer.payGem,
            offer.buyGem,
            uint128(offer.payAmt),
            uint128(offer.buyAmt),
            uint64(now) // solhint-disable-line not-rely-on-time
        );

        success = true;
    }

    // ---- Internal Functions ---- //

    // Make a new offer. Takes funds from the caller into market escrow.
    function _offer(
        uint256 payAmt,
        address payGem,
        uint256 buyAmt,
        address buyGem,
        uint8 offerType
    ) internal synchronized returns (uint256 id) {
        require(uint128(payAmt) == payAmt && uint128(buyAmt) == buyAmt, _T105);
        require(payAmt > 0 && buyAmt > 0, _T106);

        require(payGem != buyGem, _T107);
        require(
            add(tokensInUse[address(payGem)][msg.sender], payAmt) <=
                tokens[address(payGem)][msg.sender],
            _F101
        );

        OfferInfo memory info;
        info.payAmt = payAmt;
        info.payGem = payGem;
        info.buyAmt = buyAmt;
        info.buyGem = buyGem;
        info.owner = msg.sender;
        info.timestamp = uint64(now); // solhint-disable-line not-rely-on-time
        id = _nextId();
        offers[id] = info;

        tokensInUse[address(payGem)][msg.sender] = add(
            tokensInUse[address(payGem)][msg.sender],
            payAmt
        );

        emit LogItemUpdate(id);
        emit LogMake(
            uint256(id),
            keccak256(abi.encodePacked(payGem, buyGem)),
            msg.sender,
            payGem,
            buyGem,
            uint128(payAmt),
            uint128(buyAmt),
            uint64(now), // solhint-disable-line not-rely-on-time
            uint8(offerType)
        );
    }

    // Accept given `quantity` of an offer. Transfers funds from caller to
    // offer maker, and from market to caller.
    function _buy(
        uint256 id,
        uint256 quantity,
        uint8 offerType
    ) internal can_buy(id) synchronized returns (bool) {
        OfferInfo memory offer = offers[id];
        uint256 spend = mul(quantity, offer.buyAmt) / offer.payAmt;

        require(uint128(spend) == spend && uint128(quantity) == quantity, _T105);
        require(
            add(tokensInUse[address(offer.buyGem)][msg.sender], spend) <=
                tokens[address(offer.buyGem)][msg.sender],
            _F101
        );

        // For backwards semantic compatibility.
        if (
            quantity == 0 || spend == 0 || quantity > offer.payAmt || spend > offer.buyAmt
        ) {
            return false;
        }

        offers[id].payAmt = sub(offer.payAmt, quantity);
        offers[id].buyAmt = sub(offer.buyAmt, spend);

        OfferInfoHistory memory offerHistorical = offersHistory[offer
            .owner][getIdIndexProcessed(offer.owner, id)];
        offerHistorical.filledPayAmt = add(offerHistorical.filledPayAmt, quantity);
        offerHistorical.filledBuyAmt = add(offerHistorical.filledBuyAmt, spend);

        // @TODO: Check Re-entrancy for msg.sender
        tokensInUse[address(offer.payGem)][offer.owner] = sub(
            tokensInUse[address(offer.payGem)][offer.owner],
            quantity
        );

        tokens[address(offer.buyGem)][msg.sender] = sub(
            tokens[address(offer.buyGem)][msg.sender],
            spend
        );
        tokens[address(offer.payGem)][msg.sender] = add(
            tokens[address(offer.payGem)][msg.sender],
            quantity
        );
        tokens[address(offer.buyGem)][offer.owner] = add(
            tokens[address(offer.buyGem)][offer.owner],
            spend
        );
        tokens[address(offer.payGem)][offer.owner] = sub(
            tokens[address(offer.payGem)][offer.owner],
            quantity
        );

        emit LogItemUpdate(id);
        emit LogTake(
            uint256(id),
            keccak256(abi.encodePacked(offer.payGem, offer.buyGem)),
            offer.owner,
            offer.payGem,
            offer.buyGem,
            msg.sender,
            uint128(quantity),
            uint128(spend),
            uint64(now), // solhint-disable-line not-rely-on-time
            uint8(offerType)
        );
        emit LogTrade(
            quantity,
            address(offer.payGem),
            spend,
            address(offer.buyGem),
            uint64(now) // solhint-disable-line not-rely-on-time
        );

        if (offers[id].payAmt == 0) {
            delete offers[id];
            offerHistorical.filled = true;
        }

        return true;
    }

    function _take(
        uint256 id,
        uint128 maxTakeAmount,
        uint8 offerType
    ) internal {
        require(_buy(id, maxTakeAmount, offerType), _T109);
    }

    function _nextId() internal returns (uint256) {
        lastOfferId++;
        return lastOfferId;
    }

    function _nextIndex() internal returns (uint256) {
        lastOffersHistoryIndex[msg.sender]++;
        return lastOffersHistoryIndex[msg.sender];
    }
}
