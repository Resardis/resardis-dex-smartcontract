pragma solidity ^0.5.17;

import "../EternalStorage.sol";
import "../../lib/openzeppelin/IERC20.sol";

contract EventfulMarket {
    event LogItemUpdate(uint256 id);
    event LogTrade(
        uint256 payAmt,
        address indexed payGem,
        uint256 buyAmt,
        address indexed buyGem
    );

    event LogMake(
        bytes32 indexed id,
        bytes32 indexed pair,
        address indexed maker,
        address payGem,
        address buyGem,
        uint128 payAmt,
        uint128 buyAmt,
        uint64 timestamp
    );

    event LogTake(
        bytes32 id,
        bytes32 indexed pair,
        address indexed maker,
        address payGem,
        address buyGem,
        address indexed taker,
        uint128 takeAmt,
        uint128 giveAmt,
        uint64 timestamp
    );

    event LogKill(
        bytes32 indexed id,
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
    uint256 public lastOfferId;

    mapping(uint256 => OfferInfo) public offers;

    bool internal _locked;

    modifier can_buy(uint256 id) {
        require(isActive(id));
        _;
    }

    modifier can_cancel(uint256 id) {
        require(isActive(id));
        require(getOwner(id) == msg.sender);
        _;
    }

    modifier synchronized {
        require(!_locked);
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

    function getSingleOfferFromHistory(address owner, uint256 id)
        public
        view
        returns (
            uint256,
            address,
            uint256,
            address,
            bool,
            bool,
            uint256,
            uint256
        )
    {
        uint256 idIndex = getIdIndexProcessed(owner, id);
        OfferInfoHistory memory offer = offersHistory[owner][idIndex];

        return (
            offer.payAmt,
            offer.payGem,
            offer.buyAmt,
            offer.buyGem,
            offer.cancelled,
            offer.filled,
            offer.filledPayAmt,
            offer.filledBuyAmt
        );
    }

    function getIdIndexRaw(address owner, uint256 id)
        public
        view
        returns (uint256)
    {
        return offersHistoryIndices[owner][id];
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

    // Accept given `quantity` of an offer. Transfers funds from caller to
    // offer maker, and from market to caller.
    function buy(uint256 id, uint256 quantity)
        public
        can_buy(id)
        synchronized
        returns (bool)
    {
        OfferInfo memory offer = offers[id];
        uint256 spend = mul(quantity, offer.buyAmt) / offer.payAmt;

        require(uint128(spend) == spend);
        require(uint128(quantity) == quantity);
        require(
            add(tokensInUse[address(offer.buyGem)][msg.sender], spend) <=
                tokens[address(offer.buyGem)][msg.sender]
        );

        // For backwards semantic compatibility.
        if (
            quantity == 0 ||
            spend == 0 ||
            quantity > offer.payAmt ||
            spend > offer.buyAmt
        ) {
            return false;
        }

        offers[id].payAmt = sub(offer.payAmt, quantity);
        offers[id].buyAmt = sub(offer.buyAmt, spend);

        uint256 idIndex = getIdIndexProcessed(offer.owner, id);
        add(offersHistory[offer.owner][idIndex].filledPayAmt, quantity);
        add(offersHistory[offer.owner][idIndex].filledBuyAmt, spend);

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
            bytes32(id),
            keccak256(abi.encodePacked(offer.payGem, offer.buyGem)),
            offer.owner,
            offer.payGem,
            offer.buyGem,
            msg.sender,
            uint128(quantity),
            uint128(spend),
            uint64(now) // solhint-disable-line not-rely-on-time
        );
        emit LogTrade(
            quantity,
            address(offer.payGem),
            spend,
            address(offer.buyGem)
        );

        if (offers[id].payAmt == 0) {
            delete offers[id];
            offersHistory[offer.owner][idIndex].filled = true;
            offersHistory[offer.owner][idIndex].filledPayAmt = offer.payAmt;
            offersHistory[offer.owner][idIndex].filledBuyAmt = offer.buyAmt;
        }

        return true;
    }

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
            bytes32(id),
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

    // Make a new offer. Takes funds from the caller into market escrow.
    function offer(
        uint256 payAmt,
        address payGem,
        uint256 buyAmt,
        address buyGem
    ) public synchronized returns (uint256 id) {
        require(uint128(payAmt) == payAmt);
        require(uint128(buyAmt) == buyAmt);
        require(payAmt > 0);
        // @TODO: Why below cannot be true??
        // require(payGem != IERC20(0x0));
        require(buyAmt > 0);
        // @TODO: Why below cannot be true??
        // require(buyGem != IERC20(0x0));
        require(payGem != buyGem);
        require(
            add(tokensInUse[address(payGem)][msg.sender], payAmt) <=
                tokens[address(payGem)][msg.sender]
        );

        uint64 currentTime = uint64(now); // solhint-disable-line not-rely-on-time

        OfferInfo memory info;
        info.payAmt = payAmt;
        info.payGem = payGem;
        info.buyAmt = buyAmt;
        info.buyGem = buyGem;
        info.owner = msg.sender;
        info.timestamp = currentTime;
        id = _nextId();
        offers[id] = info;

        OfferInfoHistory memory infoHistory;
        infoHistory.payAmt = payAmt;
        infoHistory.payGem = payGem;
        infoHistory.buyAmt = buyAmt;
        infoHistory.buyGem = buyGem;
        infoHistory.owner = msg.sender;
        infoHistory.timestamp = currentTime;
        infoHistory.id = id;
        infoHistory.cancelled = false;
        infoHistory.filled = false;
        infoHistory.filledPayAmt = uint256(0);
        infoHistory.filledBuyAmt = uint256(0);

        tokensInUse[address(payGem)][msg.sender] = add(
            tokensInUse[address(payGem)][msg.sender],
            payAmt
        );
        offersHistory[msg.sender].push(infoHistory);

        uint256 index = _nextIndex();
        offersHistoryIndices[msg.sender][id] = index;

        emit LogItemUpdate(id);
        emit LogMake(
            bytes32(id),
            keccak256(abi.encodePacked(payGem, buyGem)),
            msg.sender,
            payGem,
            buyGem,
            uint128(payAmt),
            uint128(buyAmt),
            uint64(now) // solhint-disable-line not-rely-on-time
        );
    }

    function take(bytes32 id, uint128 maxTakeAmount) public {
        require(buy(uint256(id), maxTakeAmount));
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
