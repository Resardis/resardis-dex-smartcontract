pragma solidity ^0.5.0;

contract EternalStorage {
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
    //mapping of token addresses to mapping of total account balances (token=0 means Ether)
    mapping (address => mapping (address => uint)) public tokens;
    //mapping of token addresses to mapping of locked account balances (token=0 means Ether)
    //locked = in use = this amount of tokens is currently in order book
    mapping (address => mapping (address => uint)) public tokensInUse
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
}
