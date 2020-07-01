pragma solidity ^0.5.12;

import "./market/MarketMatching.sol";

contract Resardis is MatchingMarket {
    constructor(
        address admin_,
        address feeAccount_,
        uint feeMake_,
        uint feeTake_,
        uint resardisTokenFee_,
        uint noFeeUntil_,
        uint64 _close_time
    )
        public
    {
        admin = admin_;
        feeAccount = feeAccount_;
        feeMake = feeMake_;
        feeTake = feeTake_;
        resardisTokenFee = resardisTokenFee_;
        noFeeUntil = noFeeUntil_;
        close_time = _close_time;
    }
}
