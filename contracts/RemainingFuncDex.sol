pragma solidity ^0.5.0;

import "./vendor/openzeppelin/IERC20.sol";

import "./EternalStorage.sol";

contract Resardis is EternalStorage {
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

    function balanceOf(address token, address user) external view returns (uint) {
        return tokens[token][user];
    }

}
