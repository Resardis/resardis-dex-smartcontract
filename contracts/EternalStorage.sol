pragma solidity ^0.5.0;

import "./vendor/openzeppelin/IERC20.sol";
import "./vendor/dapphub/DSMath.sol";

contract EternalStorage is DSMath {
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

    address public admin; //the admin address
    address public feeAccount; //the account that will receive fees
    address public resardisToken;
    uint public feeMake; //percentage times (1 ether)
    uint public feeTake; //percentage times (1 ether)
    uint public noFeeUntil; // UNIX timestamp, no fee charged until that time
    uint public resardisTokenFee;
    // @TODO: Can we use IERC20 type instead of address (implicit conversion error)
    //mapping of token addresses to mapping of total account balances (token=0 means Ether)
    mapping (address => mapping (address => uint)) public tokens;
    // @TODO: Can we use IERC20 type instead of address (implicit conversion error)
    //mapping of token addresses to mapping of locked account balances (token=0 means Ether)
    //locked = in use = this amount of tokens is currently in order book
    mapping (address => mapping (address => uint)) public tokensInUse;
    //mapping of user accounts to mapping of fee payment option
    //0 = pays ether as a fee, 1 = pays resardiscoin as a fee.
    mapping (address => bool) public feeOption;
    //mapping of token addresses to permission.
    //If true, token is allowed to be deposited/traded/ordered.
    mapping (address => bool) public allowedDepositTokens;
    //mapping of token addresses to permission.
    //If true, token is allowed to be withdrawed.
    mapping (address => bool) public allowedWithdrawTokens;

    function deposit() external payable {
        tokens[address(0)][msg.sender] = add(tokens[address(0)][msg.sender], msg.value);
        emit Deposit(
            address(0),
            msg.sender,
            msg.value,
            tokens[address(0)][msg.sender]
        );
    }

    function withdraw(uint amount) external {
        require(tokens[address(0)][msg.sender] >= amount);
        tokens[address(0)][msg.sender] = sub(tokens[address(0)][msg.sender], amount);
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
        tokens[token][msg.sender] = add(tokens[token][msg.sender], amount);
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
        tokens[token][msg.sender] = sub(tokens[token][msg.sender], amount);
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
}
