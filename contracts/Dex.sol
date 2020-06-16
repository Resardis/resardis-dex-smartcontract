pragma solidity ^0.5.0;

import "./vendor/SafeMath.sol";
import "./vendor/SafeMath2.sol";
import "./vendor/IERC20.sol";


contract Resardis is SafeMath2{
  using SafeMath for uint256;
    address public admin; //the admin address
    address public feeAccount; //the account that will receive fees
    address public resardisToken;
    uint public feeMake; //percentage times (1 ether)
    uint public feeTake; //percentage times (1 ether)
    uint public noFeeUntil; // UNIX timestamp, no fee charged until that time
    uint public resardisTokenFee;
    //mapping of token addresses to mapping of account balances (token=0 means Ether)
    mapping (address => mapping (address => uint)) public tokens;
    //mapping of user accounts to mapping of order hashes to booleans
    //true = submitted by user, equivalent to offchain signature)
    mapping (address => mapping (bytes32 => bool)) public orders;
    //mapping of user accounts to mapping of order hashes to uints
    //amount of order that has been filled)
    mapping (address => mapping (bytes32 => uint)) public orderFills;
    //mapping of user accounts to mapping of fee payment option
    //0 = pays ether as a fee, 1 = pays resardiscoin as a fee.
    mapping (address => bool) public feeOption;
    //mapping of token addresses to permission.
    //If true, token is allowed to be deposited/traded/ordered.
    mapping (address => bool) public allowedDepositTokens;
    //mapping of token addresses to permission.
    //If true, token is allowed to be withdrawed.
    mapping (address => bool) public allowedWithdrawTokens;

    event Order(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce,
        address user
    );

    event Cancel(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce,
        address user
    );

    event Trade(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        address get,
        address give
    );

    event Deposit(
        address token,
        address user,
        uint amount,
        uint balance
    );

    event Withdraw(
        address token,
        address user,
        uint amount,
        uint balance
    );

    event UserChangeFeeOption(address user, bool userfeeOption);

    constructor(
        address admin_,
        address feeAccount_,
        uint feeMake_,
        uint feeTake_,
        uint resardisTokenFee_,
        uint noFeeUntil_
    )
        public
    {
        admin = admin_;
        feeAccount = feeAccount_;
        feeMake = feeMake_;
        feeTake = feeTake_;
        resardisTokenFee = resardisTokenFee_;
        noFeeUntil = noFeeUntil_;
    }
    //DDDDDDDDDDDD start
    struct sortInfo {
        uint next;  //points to id of next higher offer
        uint prev;  //points to id of previous lower offer
        uint delb;  //the blocknumber where this entry was marked for delete
    }
    mapping(uint => sortInfo) public _rank;                     //doubly linked lists of sorted offer ids
    mapping(address => mapping(address => uint)) public _best;  //id of the highest offer for a token pair
    mapping(address => mapping(address => uint)) public _span;  //number of offers stored for token pair in sorted orderbook
    mapping(address => uint) public _dust;                      //minimum sell amount for a token to avoid dust offers
    mapping(uint => uint) public _near;         //next unsorted offer id
    uint _head;                                 //first unsorted offer id
    uint public dustId;

    uint public last_offer_id;

    mapping (uint => OfferInfo) public offers;

    struct OfferInfo {
        uint    amountGive;
        address tokenGive;
        uint    amountGet;
        address tokenGet;
        address owner;
        uint64  timestamp;
    }

    function _next_id()
        internal
        returns (uint)
    {
        last_offer_id++; return last_offer_id;
    }

    function offer(uint amountGive, address tokenGive, uint amountGet, address tokenGet)
        public
        returns (uint id)
    {
        require(uint128(amountGive) == amountGive);
        require(uint128(amountGet) == amountGet);
        require(amountGive > 0);
        require(amountGet > 0);
        //require(tokenGive != tokenGet);

        OfferInfo memory info;
        info.amountGive = amountGive;
        info.tokenGive = tokenGive;
        info.amountGet = amountGet;
        info.tokenGet = tokenGet;
        info.owner = msg.sender;
        info.timestamp = uint64(now);
        id = _next_id();
        offers[id] = info;
    }
    //Transfers funds from caller to offer maker, and from market to caller.
    function buy(uint id, uint amount)
        public
        returns (bool)
    {
        return _buys(id, amount);
    }


    //DDDDDDDDDDDD end
    function() external {
        revert();
    }

    function changeAdmin(address admin_) external {
        require(msg.sender == admin);
        admin = admin_;
    }

    function changeFeeAccount(address feeAccount_) external {
        require(msg.sender == admin);
        feeAccount = feeAccount_;
    }

    function changeFeeMake(uint feeMake_) external {
        require(msg.sender == admin);
        require(feeMake_ <= feeMake);
        feeMake = feeMake_;
    }

    function changeFeeTake(uint feeTake_) external {
        require(msg.sender == admin);
        require(feeTake_ <= feeTake);
        feeTake = feeTake_;
    }

    function changeNoFeeUntil(uint noFeeUntil_) external {
        require(msg.sender == admin);
        noFeeUntil = noFeeUntil_;
    }

    function getFeeOption(address user_) external view returns(bool) {
        return feeOption[user_];
    }

    function changeFeeOption(address user_, bool level_) external {
        require(msg.sender == user_);
        feeOption[user_] = level_;
        emit UserChangeFeeOption(msg.sender, feeOption[msg.sender]);
    }

    function setResardisTokenAddress(address tokenaddress_) external {
        require(msg.sender == admin);
        resardisToken = tokenaddress_;
    }

    function changeResardisTokenFee(uint fee_) external {
        require(msg.sender == admin);
        resardisTokenFee = fee_;
    }

    function getAllowedDepositToken(address token_) external view returns(bool) {
        return allowedDepositTokens[token_];
    }

    function getAllowedWithdrawToken(address token_) external view returns(bool) {
        return allowedWithdrawTokens[token_];
    }

    function changeAllowedToken(
        address token_,
        bool depositPermit_,
        bool withdrawPermit_
    )
        external
    {
        require(msg.sender == admin);
        allowedDepositTokens[token_] = depositPermit_;
        allowedWithdrawTokens[token_] = withdrawPermit_;
    }

    function deposit() external payable {
        tokens[address(0)][msg.sender] = tokens[address(0)][msg.sender].add(msg.value);
        emit Deposit(
            address(0),
            msg.sender,
            msg.value,
            tokens[address(0)][msg.sender]
        );
    }

    function withdraw(uint amount) external {
        require(tokens[address(0)][msg.sender] >= amount);
        tokens[address(0)][msg.sender] = tokens[address(0)][msg.sender].sub(amount);
        msg.sender.transfer(amount);
        emit Withdraw(
            address(0),
            msg.sender,
            amount,
            tokens[address(0)][msg.sender]
        );
    }

    function depositToken(address token, uint amount) external {
        //remember to call Token(address).approve(this, amount)
        //or this contract will not be able to do the transfer on your behalf.
        require(token!=address(0));
        require(allowedDepositTokens[token] == true);
        tokens[token][msg.sender] = tokens[token][msg.sender].add(amount);
        require(IERC20(token).transferFrom(msg.sender, address(this), amount));
        emit Deposit(
            token,
            msg.sender,
            amount,
            tokens[token][msg.sender]
        );
    }

    function withdrawToken(address token, uint amount) external {
        require(token!=address(0));
        require(allowedWithdrawTokens[token] == true);
        require(tokens[token][msg.sender] >= amount);
        tokens[token][msg.sender] = tokens[token][msg.sender].sub(amount);
        require(IERC20(token).transfer(msg.sender, amount));
        emit Withdraw(
            token,
            msg.sender,
            amount,
            tokens[token][msg.sender]
        );
    }

    function balanceOf(address token, address user) external view returns (uint) {
        return tokens[token][user];
    }

    function tradeMatch(
        uint id,
        uint amount
    )
        public
        returns (bool)
    {
        OfferInfo memory offerq = offers[id];
        uint spend = mul(amount, offerq.amountGet) / offerq.amountGive;

        require(uint128(spend) == spend);
        require(uint128(amount) == amount);
        //amount is in amountGet terms
        require(allowedDepositTokens[offerq.tokenGet] == true && allowedDepositTokens[offerq.tokenGive] == true);

        offers[id].amountGive = sub(offerq.amountGive, amount);
        offers[id].amountGet = sub(offerq.amountGet, spend);
         tradeBalances(
            offerq.tokenGet,
            offerq.amountGet,
            offerq.tokenGive,
            offerq.amountGive,
            offerq.owner,
            amount
        );
        if (offers[id].amountGive == 0) {
          delete offers[id];
        }
    }


    function tradeBalances(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        address user,
        uint amount
    )
        private
    {
        uint feeMakeXfer = 0;
        uint feeTakeXfer = 0;
        uint resardisTokenFeeXfer = 0;

        if (now >= noFeeUntil) {
            feeMakeXfer = amount.mul(feeMake) / (1 ether);
            feeTakeXfer = amount.mul(feeTake) / (1 ether);
            resardisTokenFeeXfer = resardisTokenFee;
        }

        if (feeOption[user] == false && feeOption[msg.sender] == false) {
            tokens[tokenGet][msg.sender] = tokens[tokenGet][msg.sender].sub(amount.add(feeTakeXfer));
            tokens[tokenGet][user] = tokens[tokenGet][user].add(amount.sub(feeMakeXfer));
            tokens[tokenGet][feeAccount] = tokens[tokenGet][feeAccount].add(feeMakeXfer.add(feeTakeXfer));
            tokens[tokenGive][user] = tokens[tokenGive][user].sub(amountGive.mul(amount) / amountGet);
            tokens[tokenGive][msg.sender] = tokens[tokenGive][msg.sender].add(amountGive.mul(amount) / amountGet);
        } else if (feeOption[user] == true && feeOption[msg.sender] == true) {
            tokens[tokenGet][msg.sender] = tokens[tokenGet][msg.sender].sub(amount);
            tokens[resardisToken][msg.sender] = tokens[resardisToken][msg.sender].sub(resardisTokenFeeXfer); //depends on resardis token price. (a new solution will be designed.)
            tokens[tokenGet][user] = tokens[tokenGet][user].add(amount);
            tokens[resardisToken][user] = tokens[resardisToken][user].sub(resardisTokenFeeXfer);
            tokens[resardisToken][feeAccount] = tokens[resardisToken][feeAccount].add(resardisTokenFeeXfer).add(resardisTokenFeeXfer);//depends on resardis token price. (a new solution will be designed.)
            tokens[tokenGive][user] = tokens[tokenGive][user].sub(amountGive.mul(amount) / amountGet);
            tokens[tokenGive][msg.sender] = tokens[tokenGive][msg.sender].add(amountGive.mul(amount) / amountGet);
        } else if (feeOption[user] == false && feeOption[msg.sender] == true) {
            tokens[tokenGet][msg.sender] = tokens[tokenGet][msg.sender].sub(amount);
            tokens[resardisToken][msg.sender] = tokens[resardisToken][msg.sender].sub(resardisTokenFeeXfer); //depends on resardis token price. (a new solution will be designed.)
            tokens[tokenGet][user] = tokens[tokenGet][user].add(amount.sub(feeMakeXfer));
            tokens[resardisToken][feeAccount] = tokens[resardisToken][feeAccount].add(resardisTokenFeeXfer);//depends on resardis token price. (a new solution will be designed.)
            tokens[tokenGet][feeAccount] = tokens[tokenGet][feeAccount].add(feeMakeXfer);
            tokens[tokenGive][user] = tokens[tokenGive][user].sub(amountGive.mul(amount) / amountGet);
            tokens[tokenGive][msg.sender] = tokens[tokenGive][msg.sender].add(amountGive);
        } else if (feeOption[user] == true && feeOption[msg.sender] == false) {
            tokens[tokenGet][msg.sender] = tokens[tokenGet][msg.sender].sub(amount.add(feeTakeXfer));
            tokens[tokenGet][user] = tokens[tokenGet][user].add(amount);
            tokens[resardisToken][user] = tokens[resardisToken][user].sub(resardisTokenFeeXfer);
            tokens[resardisToken][feeAccount] = tokens[resardisToken][feeAccount].add(resardisTokenFeeXfer);//depends on resardis token price. (a new solution will be designed.)
            tokens[tokenGet][feeAccount] = tokens[tokenGet][feeAccount].add(feeTakeXfer);
            tokens[tokenGive][user] = tokens[tokenGive][user].sub(amountGive.mul(amount) / amountGet);
            tokens[tokenGive][msg.sender] = tokens[tokenGive][msg.sender].add(amountGive);
        }
    }
/* MATCHER

*/


    function offer_user(
        uint amountGive,    //maker (ask) sell how much
        address tokenGive,   //maker (ask) sell which token
        uint amountGet,    //taker (ask) buy how much
        address tokenGet    //taker (ask) buy which token
    )
        public
        returns (uint)
    {
        return _offeru(amountGive, tokenGive, amountGet, tokenGet);
    }

    // Make a new offer. Takes funds from the caller into market escrow.
    function offer_user(
        uint amountGive,    //maker (ask) sell how much
        address tokenGive,   //maker (ask) sell which token
        uint amountGet,    //maker (ask) buy how much
        address tokenGet,   //maker (ask) buy which token
        uint pos         //position to insert offer, 0 should be used if unknown
    )
        public
        returns (uint)
    {
        return offer_user(amountGive, tokenGive, amountGet, tokenGet, pos, true);
    }

    function offer_user(
        uint amountGive,    //maker (ask) sell how much
        address tokenGive,   //maker (ask) sell which token
        uint amountGet,    //maker (ask) buy how much
        address tokenGet,   //maker (ask) buy which token
        uint pos,        //position to insert offer, 0 should be used if unknown
        bool rounding    //match "close enough" orders?
    )
        public
        returns (uint)
    {
         return _matcho(amountGive, tokenGive, amountGet, tokenGet, pos, rounding);

    }

        function getBestOffer(address sell_gem, address buy_gem) public view returns(uint) {
        return _best[address(sell_gem)][address(buy_gem)];
    }

    //return the next worse offer in the sorted list
    //      the worse offer is the higher one if its an ask,
    //      a lower one if its a bid offer,
    //      and in both cases the newer one if they're equal.
    function getWorseOffer(uint id) public view returns(uint) {
        return _rank[id].prev;
    }

    //return the next better offer in the sorted list
    //      the better offer is in the lower priced one if its an ask,
    //      the next higher priced one if its a bid offer
    //      and in both cases the older one if they're equal.
    function getBetterOffer(uint id) public view returns(uint) {

        return _rank[id].next;
    }

    //return the amount of better offers for a token pair
    function getOfferCount(address sell_gem, address buy_gem) public view returns(uint) {
        return _span[address(sell_gem)][address(buy_gem)];
    }

    //get the first unsorted offer that was inserted by a contract
    //      Contracts can't calculate the insertion position of their offer because it is not an O(1) operation.
    //      Their offers get put in the unsorted list of offers.
    //      Keepers can calculate the insertion position offchain and pass it to the insert() function to insert
    //      the unsorted offer into the sorted list. Unsorted offers will not be matched, but can be bought with buy().
    function getFirstUnsortedOffer() public view returns(uint) {
        return _head;
    }

    //get the next unsorted offer
    //      Can be used to cycle through all the unsorted offers.
    function getNextUnsortedOffer(uint id) public view returns(uint) {
        return _near[id];
    }

    function isOfferSorted(uint id) public view returns(bool) {
        return _rank[id].next != 0
               || _rank[id].prev != 0
               || _best[address(offers[id].tokenGive)][address(offers[id].tokenGet)] == id;
    }

        function isActive(uint id) public view returns (bool active) {
        return offers[id].timestamp > 0;
    }

/*

 */

            // ---- Internal Functions ---- //

    function _buys(uint id, uint amount)
        internal
        returns (bool)
    {
        if (amount == offers[id].amountGive) {
            if (isOfferSorted(id)) {
                //offers[id] must be removed from sorted list because all of it is bought
                _unsort(id);
            }else{
                _hide(id);
            }
        }
        require(tradeMatch(id, amount));
        return true;
    }

    //find the id of the next higher offer after offers[id]
    function _find(uint id)
        internal
        view
        returns (uint)
    {
        require( id > 0 );

        address tokenGet = address(offers[id].tokenGet);
        address tokenGive = address(offers[id].tokenGive);
        uint top = _best[tokenGive][tokenGet];
        uint old_top = 0;

        // Find the larger-than-id order whose successor is less-than-id.
        while (top != 0 && _isPricedLtOrEq(id, top)) {
            old_top = top;
            top = _rank[top].prev;
        }
        return old_top;
    }

    //find the id of the next higher offer after offers[id]
    function _findpos(uint id, uint pos)
        internal
        view
        returns (uint)
    {
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
            if(_isPricedLtOrEq(id, pos)) {
                uint old_pos;

                // Guaranteed to run at least once because of
                // the prior if statements.
                while (pos != 0 && _isPricedLtOrEq(id, pos)) {
                    old_pos = pos;
                    pos = _rank[pos].prev;
                }
                return old_pos;

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
        uint low,   //lower priced offer's id
        uint high   //higher priced offer's id
    )
        internal
        view
        returns (bool)
    {
        return mul(offers[low].amountGet, offers[high].amountGive)
          >= mul(offers[high].amountGet, offers[low].amountGive);
    }

    //these variables are global only because of solidity local variable limit

    //match offers with taker offer, and execute token transactions
    function _matcho(
        uint t_amountGive,    //taker sell how much
        address t_tokenGive,   //taker sell which token
        uint t_amountGet,    //taker buy how much
        address t_tokenGet,   //taker buy which token
        uint pos,          //position id
        bool rounding      //match "close enough" orders?
    )
        internal
        returns (uint id)
    {
        uint best_maker_id;    //highest maker id
        uint t_amountGet_old;    //taker buy how much saved
        uint m_amountGet;        //maker offer wants to buy this much token
        uint m_amountGive;        //maker offer wants to sell this much token

        // there is at least one offer stored for token pair
        while (_best[address(t_tokenGet)][address(t_tokenGive)] > 0) {
            best_maker_id = _best[address(t_tokenGet)][address(t_tokenGive)];
            m_amountGet = offers[best_maker_id].amountGet;
            m_amountGive = offers[best_maker_id].amountGive;

            // Ugly hack to work around rounding errors. Based on the idea that
            // the furthest the amounts can stray from their "true" values is 1.
            // Ergo the worst case has t_amountGive and m_amountGive at +1 away from
            // their "correct" values and m_amountGet and t_amountGet at -1.
            // Since (c - 1) * (d - 1) > (a + 1) * (b + 1) is equivalent to
            // c * d > a * b + a + b + c + d, we write...
            if (mul(m_amountGet, t_amountGet) > mul(t_amountGive, m_amountGive) +
                (rounding ? m_amountGet + t_amountGet + t_amountGive + m_amountGive : 0))
            {
                break;
            }
            // ^ The `rounding` parameter is a compromise borne of a couple days
            // of discussion.
            tradeMatch(best_maker_id, min(m_amountGive, t_amountGet));
            t_amountGet_old = t_amountGet;
            t_amountGet = sub(t_amountGet, min(m_amountGive, t_amountGet));
            t_amountGive = mul(t_amountGet, t_amountGive) / t_amountGet_old;

            if (t_amountGive == 0 || t_amountGet == 0) {
                break;
            }
        }

        if (t_amountGet > 0 && t_amountGive > 0 && t_amountGive >= _dust[address(t_tokenGive)]) {
            //new offer should be created
            id =offer(t_amountGive, t_tokenGive, t_amountGet, t_tokenGet);
            //insert offer into the sorted list
            _sort(id, pos);
        }
    }

    // Make a new offer without putting it in the sorted list.
    // Takes funds from the caller into market escrow.
    // ****Available to authorized contracts only!**********
    // Keepers should call insert(id,pos) to put offer in the sorted list.
    function _offeru(
        uint amountGive,      //maker (ask) sell how much
        address tokenGive,     //maker (ask) sell which token
        uint amountGet,      //maker (ask) buy how much
        address tokenGet      //maker (ask) buy which token
    )
        internal
        returns (uint id)
    {
        require(_dust[address(tokenGive)] <= amountGive);
        id = offer(amountGive, tokenGive, amountGet, tokenGet);
        _near[id] = _head;
        _head = id;
    }

    //put offer into the sorted list
    function _sort(
        uint id,    //maker (ask) id
        uint pos    //position to insert into
    )
        internal
    {
        require(isActive(id));

        address tokenGet = offers[id].tokenGet;
        address tokenGive = offers[id].tokenGive;
        uint prev_id;                                      //maker (ask) id

        pos = pos == 0 || offers[pos].tokenGive != tokenGive || offers[pos].tokenGet != tokenGet || !isOfferSorted(pos)
        ?
            _find(id)
        :
            _findpos(id, pos);

        if (pos != 0) {                                    //offers[id] is not the highest offer
            //requirement below is satisfied by statements above
            //require(_isPricedLtOrEq(id, pos));
            prev_id = _rank[pos].prev;
            _rank[pos].prev = id;
            _rank[id].next = pos;
        } else {                                           //offers[id] is the highest offer
            prev_id = _best[address(tokenGive)][address(tokenGet)];
            _best[address(tokenGive)][address(tokenGet)] = id;
        }

        if (prev_id != 0) {                               //if lower offer does exist
            //requirement below is satisfied by statements above
            //require(!_isPricedLtOrEq(id, prev_id));
            _rank[prev_id].next = id;
            _rank[id].prev = prev_id;
        }

        _span[address(tokenGive)][address(tokenGet)]++;
    }

    // Remove offer from the sorted list (does not cancel offer)
    function _unsort(
        uint id    //id of maker (ask) offer to remove from sorted list
    )
        internal
        returns (bool)
    {
        address tokenGet = address(offers[id].tokenGet);
        address tokenGive = address(offers[id].tokenGive);
        require(_span[tokenGive][tokenGet] > 0);

        require(_rank[id].delb == 0 &&                    //assert id is in the sorted list
                 isOfferSorted(id));

        if (id != _best[tokenGive][tokenGet]) {              // offers[id] is not the highest offer
            require(_rank[_rank[id].next].prev == id);
            _rank[_rank[id].next].prev = _rank[id].prev;
        } else {                                          //offers[id] is the highest offer
            _best[tokenGive][tokenGet] = _rank[id].prev;
        }

        if (_rank[id].prev != 0) {                        //offers[id] is not the lowest offer
            require(_rank[_rank[id].prev].next == id);
            _rank[_rank[id].prev].next = _rank[id].next;
        }

        _span[tokenGive][tokenGet]--;
        _rank[id].delb = block.number;                    //mark _rank[id] for deletion
        return true;
    }

    //Hide offer from the unsorted order book (does not cancel offer)
    function _hide(
        uint id     //id of maker offer to remove from unsorted list
    )
        internal
        returns (bool)
    {
        uint uid = _head;               //id of an offer in unsorted offers list
        uint pre = uid;                 //id of previous offer in unsorted offers list

        require(!isOfferSorted(id));    //make sure offer id is not in sorted offers list

        if (_head == id) {              //check if offer is first offer in unsorted offers list
            _head = _near[id];          //set head to new first unsorted offer
            _near[id] = 0;              //delete order from unsorted order list
            return true;
        }
        while (uid > 0 && uid != id) {  //find offer in unsorted order list
            pre = uid;
            uid = _near[uid];
        }
        if (uid != id) {                //did not find offer id in unsorted offers list
            return false;
        }
        _near[pre] = _near[id];         //set previous unsorted offer to point to offer after offer id
        _near[id] = 0;                  //delete order from unsorted order list
        return true;
    }

}
