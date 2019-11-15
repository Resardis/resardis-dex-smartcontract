pragma solidity ^0.5.0;

import "./vendor/SafeMath.sol";
import "./vendor/IERC20.sol";

contract Resardis {
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

    function order(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce
    )
        external
    {
        require(allowedDepositTokens[tokenGet] == true && allowedDepositTokens[tokenGive] == true);
        bytes32 hash = sha256(
            abi.encodePacked(
                this,
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                nonce
            )
        );
        orders[msg.sender][hash] = true;
        emit Order(
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            nonce,
            msg.sender
        );
    }

    function trade(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce,
        address user,
        uint amount
    )
        external
    {
        //amount is in amountGet terms
        require(allowedDepositTokens[tokenGet] == true && allowedDepositTokens[tokenGive] == true);
        bytes32 hash = sha256(
            abi.encodePacked(
                this,
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                nonce
            )
        );
        require(
            (
                orders[user][hash] &&
                block.number <= expires &&
                orderFills[user][hash].add(amount) <= amountGet
            )
        );
        tradeBalances(
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            user,
            amount
        );
        orderFills[user][hash] = orderFills[user][hash].add(amount);
        emit Trade(
            tokenGet,
            amount,
            tokenGive,
            amountGive * amount / amountGet,
            user,
            msg.sender
        );
    }

    function testTrade(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce,
        address user,
        uint amount,
        address sender
    )
        external view returns(bool)
    {
        if (!(
            tokens[tokenGet][sender] >= amount &&
            availableVolume(
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                nonce,
                user
            ) >= amount
        )) return false;
        if (!(
          allowedDepositTokens[tokenGet] == true &&
          allowedDepositTokens[tokenGive] == true
        )) return false;
        return true;
    }

    function amountFilled(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce,
        address user
    )
        external view returns(uint)
    {
        bytes32 hash = sha256(
            abi.encodePacked(
                this,
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                nonce
            )
        );
        return orderFills[user][hash];
    }

    function cancelOrder(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce
    )
        external
    {
        bytes32 hash = sha256(
            abi.encodePacked(
                this,
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                nonce
            )
        );
        require(orders[msg.sender][hash]);
        orderFills[msg.sender][hash] = amountGet;
        emit Cancel(
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            expires,
            nonce,
            msg.sender
        );
    }

    function availableVolume(
        address tokenGet,
        uint amountGet,
        address tokenGive,
        uint amountGive,
        uint expires,
        uint nonce,
        address user
    )
        public view returns(uint)
    {
        bytes32 hash = sha256(
            abi.encodePacked(
                this,
                tokenGet,
                amountGet,
                tokenGive,
                amountGive,
                expires,
                nonce
            )
        );
        if (!(orders[user][hash] && block.number <= expires)) return 0;
        uint available1 = amountGet.sub(orderFills[user][hash]);
        uint available2 = amountGet.mul(tokens[tokenGive][user]) / amountGive;
        if (available1<available2) return available1;
        return available2;
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
}
