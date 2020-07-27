pragma solidity ^0.5.17;
pragma experimental ABIEncoderV2;

import "../lib/openzeppelin/IERC20.sol";
import "../lib/dapphub/DSMath.sol";

contract EternalStorage is DSMath {
    event Deposit(address token, address user, uint256 amount, uint256 balance);

    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    address public admin; //the admin address

    struct DepositInfo {
        address token; // address of deposited token
        uint256 amount; // amount of deposited token
        address owner;
        uint64 timestamp;
    }

    struct WithdrawInfo {
        address token; // address of deposited token
        uint256 amount; // amount of deposited token
        address owner;
        uint64 timestamp;
    }

    // OfferInfo is used in volatile offer book
    // Items in the book can get deleted to ease iteration
    struct OfferInfo {
        uint256 payAmt;
        address payGem;
        uint256 buyAmt;
        address buyGem;
        address owner;
        uint64 timestamp;
    }

    // OfferInfoHistory is an extension to OfferInfo
    // Used in permanent order history book
    // of which no element gets ever deleted
    struct OfferInfoHistory {
        uint256 payAmt;
        address payGem;
        uint256 buyAmt;
        address buyGem;
        address owner;
        uint64 timestamp;
        uint256 id;
        bool cancelled;
        bool filled;
        uint256 filledPayAmt;
        uint256 filledBuyAmt;
        uint8 offerType;
    }

    // @TODO: Can we use IERC20 type instead of address (implicit conversion error)
    //mapping of token addresses to mapping of total account balances (token=0 means Ether)
    mapping(address => mapping(address => uint256)) public tokens;
    // @TODO: Can we use IERC20 type instead of address (implicit conversion error)
    //mapping of token addresses to mapping of locked account balances (token=0 means Ether)
    //locked = in use = this amount of tokens is currently in order book
    mapping(address => mapping(address => uint256)) public tokensInUse;
    //mapping of accounts to mapping of token addresses to deposit info (token=0 => Ether)
    mapping(address => mapping(address => DepositInfo[])) public depositHistory;
    //mapping of accounts to mapping of token addresses to withdraw info (token=0 => Ether)
    mapping(address => mapping(address => WithdrawInfo[]))
        public withdrawHistory;
    //mapping of user accounts to mapping of OfferInfoHistory array
    mapping(address => OfferInfoHistory[]) public offersHistory;
    //mapping of user accounts to the (last index no of offersHistory + 1)
    //thus the actual last index is -1
    mapping(address => uint256) public lastOffersHistoryIndex;
    //mapping of user accounts to mapping of offer ids to offersHistory index + 1
    //again, the actual last index is -1
    mapping(address => mapping(uint256 => uint256)) public offersHistoryIndices;
    //mapping of token addresses to permission.
    //If true, token is allowed to be deposited/traded/ordered.
    mapping(address => bool) public allowedDepositTokens;
    //mapping of token addresses to permission.
    //If true, token is allowed to be withdrawed.
    mapping(address => bool) public allowedWithdrawTokens;
    //mapping of available offer types to boolean (true=available)
    mapping(uint8 => bool) public availableOfferTypes;

    function deposit() external payable {
        tokens[address(0)][msg.sender] = add(
            tokens[address(0)][msg.sender],
            msg.value
        );

        uint64 currentTime = uint64(now); // solhint-disable-line not-rely-on-time
        DepositInfo memory depositInfo;
        depositInfo.token = address(0);
        depositInfo.amount = msg.value;
        depositInfo.owner = msg.sender;
        depositInfo.timestamp = currentTime;
        depositHistory[msg.sender][address(0)].push(depositInfo);

        emit Deposit(
            address(0),
            msg.sender,
            msg.value,
            tokens[address(0)][msg.sender]
        );
    }

    function withdraw(uint256 amount) external {
        require(tokens[address(0)][msg.sender] >= amount);
        tokens[address(0)][msg.sender] = sub(
            tokens[address(0)][msg.sender],
            amount
        );

        uint64 currentTime = uint64(now); // solhint-disable-line not-rely-on-time
        WithdrawInfo memory withdrawInfo;
        withdrawInfo.token = address(0);
        withdrawInfo.amount = amount;
        withdrawInfo.owner = msg.sender;
        withdrawInfo.timestamp = currentTime;
        withdrawHistory[msg.sender][address(0)].push(withdrawInfo);

        msg.sender.transfer(amount);

        emit Withdraw(
            address(0),
            msg.sender,
            amount,
            tokens[address(0)][msg.sender]
        );
    }

    function depositToken(address token, uint256 amount) external {
        //remember to call Token(address).approve(this, amount)
        //or this contract will not be able to do the transfer on your behalf.
        require(token != address(0));
        require(allowedDepositTokens[token] == true);

        tokens[token][msg.sender] = add(tokens[token][msg.sender], amount);

        uint64 currentTime = uint64(now); // solhint-disable-line not-rely-on-time
        DepositInfo memory depositInfo;
        depositInfo.token = token;
        depositInfo.amount = amount;
        depositInfo.owner = msg.sender;
        depositInfo.timestamp = currentTime;
        depositHistory[msg.sender][token].push(depositInfo);

        require(IERC20(token).transferFrom(msg.sender, address(this), amount));

        emit Deposit(token, msg.sender, amount, tokens[token][msg.sender]);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(token != address(0));
        require(allowedWithdrawTokens[token] == true);
        require(tokens[token][msg.sender] >= amount);

        uint64 currentTime = uint64(now); // solhint-disable-line not-rely-on-time
        WithdrawInfo memory withdrawInfo;
        withdrawInfo.token = token;
        withdrawInfo.amount = amount;
        withdrawInfo.owner = msg.sender;
        withdrawInfo.timestamp = currentTime;
        withdrawHistory[msg.sender][token].push(withdrawInfo);

        tokens[token][msg.sender] = sub(tokens[token][msg.sender], amount);

        require(IERC20(token).transfer(msg.sender, amount));

        emit Withdraw(token, msg.sender, amount, tokens[token][msg.sender]);
    }

    function changeAllowedToken(
        address token_,
        bool depositPermit_,
        bool withdrawPermit_
    ) external {
        require(msg.sender == admin);
        allowedDepositTokens[token_] = depositPermit_;
        allowedWithdrawTokens[token_] = withdrawPermit_;
    }

    function changeAvailableOfferType(uint8 offerType, bool state)
        external
    {
        require(msg.sender == admin);
        availableOfferTypes[offerType] = state;
    }

    function balanceOf(address token, address user)
        external
        view
        returns (uint256)
    {
        return tokens[token][user];
    }

    function balanceInUse(address token, address user)
        external
        view
        returns (uint256)
    {
        return tokensInUse[token][user];
    }

    function getAllowedDepositToken(address token_)
        external
        view
        returns (bool)
    {
        return allowedDepositTokens[token_];
    }

    function getAllowedWithdrawToken(address token_)
        external
        view
        returns (bool)
    {
        return allowedWithdrawTokens[token_];
    }
}
