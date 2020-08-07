pragma solidity ^0.5.17;

import "../lib/openzeppelin/IERC20.sol";
import "../lib/dapphub/DSMath.sol";
import "../lib/dapphub/DSAuth.sol";

import "./ErrorCodes.sol";

// solhint-disable-next-line max-states-count
contract EternalStorage is ErrorCodes, DSMath, DSAuth {
    event LogDeposit(
        address indexed token,
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    event LogWithdraw(
        address indexed token,
        address indexed user,
        uint256 amount,
        uint256 balance
    );

    event LogOfferType(uint8 offerType, bool state);

    struct DepositWithdrawInfo {
        address token; // address of deposited/withdrawn token
        uint256 amount; // amount of deposited/withdrawn token
        address owner;
        uint64 timestamp;
        bool deposit;
        bool withdraw;
    }

    struct SortInfo {
        uint256 next; //points to id of next higher offer
        uint256 prev; //points to id of previous lower offer
        uint256 delb; //the blocknumber where this entry was marked for delete
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
        uint256 id;
        uint256 payAmt;
        uint256 filledPayAmt;
        address payGem;
        uint256 buyAmt;
        uint256 filledBuyAmt;
        address buyGem;
        address owner;
        uint64 timestamp;
        uint8 offerType;
        bool cancelled;
        bool filled;
    }

    uint256 public lastOfferId; // id of the last offer
    uint256 public dustId; // id of the latest offer marked as dust
    bool internal _locked; // re-entrancy protection

    //doubly linked lists of sorted offer ids
    mapping(uint256 => SortInfo) public rank;
    //mapping of offer IDs to offer info, volatile order book
    mapping(uint256 => OfferInfo) public offers;
    //minimum sell amount for a token to avoid dust offers
    mapping(address => uint256) public dust;
    //mapping of user accounts to the (last index no of offersHistory + 1)
    //thus the actual last index is -1
    mapping(address => uint256) public lastOffersHistoryIndex;
    //mapping of available offer types to boolean (true=present)
    //0->Limit, 1->Market, 2->Fill-or-Kill
    mapping(uint8 => bool) public offerTypes;
    //mapping of token addresses to permission.
    //If true, token is allowed to be deposited/traded/ordered.
    //id of the highest offer for a token pair
    mapping(address => mapping(address => uint256)) public best;
    //number of offers stored for token pair in sorted orderbook
    mapping(address => mapping(address => uint256)) public span;
    // @TODO: Can we use IERC20 type instead of address (implicit conversion error)
    //mapping of token addresses to mapping of total account balances (token=0 means Ether)
    mapping(address => mapping(address => uint256)) public tokens;
    // @TODO: Can we use IERC20 type instead of address (implicit conversion error)
    //mapping of token addresses to mapping of locked account balances (token=0 means Ether)
    //locked = in use = this amount of tokens is currently in order book
    mapping(address => mapping(address => uint256)) public tokensInUse;
    //mapping of accounts to mapping of token addresses to deposit/withdraw info (token=0 => Ether)
    mapping(address => mapping(address => DepositWithdrawInfo[])) public depositWithdrawHistory;
    //mapping of user accounts to mapping of offer ids to offersHistory index + 1
    //again, the actual last index is -1
    mapping(address => mapping(uint256 => uint256)) public offersHistoryIndices;
    //mapping of user accounts to mapping of OfferInfoHistory array
    mapping(address => OfferInfoHistory[]) public offersHistory;

    function deposit() external payable {
        _setDepWithHist(address(0), msg.value, true, false);
        tokens[address(0)][msg.sender] = add(tokens[address(0)][msg.sender], msg.value);

        emit LogDeposit(
            address(0),
            msg.sender,
            msg.value,
            tokens[address(0)][msg.sender]
        );
    }

    function withdraw(uint256 amount) external {
        require(tokens[address(0)][msg.sender] >= amount, _F101);

        _setDepWithHist(address(0), amount, false, true);
        tokens[address(0)][msg.sender] = sub(tokens[address(0)][msg.sender], amount);

        msg.sender.transfer(amount);

        emit LogWithdraw(address(0), msg.sender, amount, tokens[address(0)][msg.sender]);
    }

    function depositToken(address token, uint256 amount) external {
        //remember to call Token(address).approve(this, amount)
        //or this contract will not be able to do the transfer on your behalf.
        require(token != address(0), _F102);

        _setDepWithHist(token, amount, true, false);
        tokens[token][msg.sender] = add(tokens[token][msg.sender], amount);

        require(IERC20(token).transferFrom(msg.sender, address(this), amount), _F104);

        emit LogDeposit(token, msg.sender, amount, tokens[token][msg.sender]);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(token != address(0), _F102);
        require(tokens[token][msg.sender] >= amount, _F101);

        _setDepWithHist(token, amount, false, true);
        tokens[token][msg.sender] = sub(tokens[token][msg.sender], amount);

        require(IERC20(token).transfer(msg.sender, amount), _F104);

        emit LogWithdraw(token, msg.sender, amount, tokens[token][msg.sender]);
    }

    function setOfferType(uint8 offerType, bool state) external auth {
        offerTypes[offerType] = state;

        emit LogOfferType(offerType, state);
    }

    function balanceOf(address token, address user) external view returns (uint256) {
        return tokens[token][user];
    }

    function balanceInUse(address token, address user) external view returns (uint256) {
        return tokensInUse[token][user];
    }

    function _setDepWithHist(
        address token,
        uint256 amount,
        bool isDeposit,
        bool isWithdraw
    )
        internal
    {
        DepositWithdrawInfo memory depWithInfo;
        depWithInfo.token = token;
        depWithInfo.amount = amount;
        depWithInfo.owner = msg.sender;
        depWithInfo.timestamp = uint64(now); // solhint-disable-line not-rely-on-time
        depWithInfo.deposit = isDeposit;
        depWithInfo.withdraw = isWithdraw;
        depositWithdrawHistory[msg.sender][token].push(depWithInfo);
    }

}
