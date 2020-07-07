pragma solidity ^0.5.12;

import "./market/MarketMatching.sol";

contract Resardis is MatchingMarket {
    constructor(
        address admin_,
        uint64 _close_time
    )
        public
    {
        admin = admin_;
        close_time = _close_time;
    }
}
