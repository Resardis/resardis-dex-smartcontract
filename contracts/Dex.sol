pragma solidity ^0.5.17;

import "./market/MarketMatching.sol";

contract Resardis is MatchingMarket {
    constructor(address admin_, uint64 closeTime_) public {
        admin = admin_;
        closeTime = closeTime_;
    }
}
