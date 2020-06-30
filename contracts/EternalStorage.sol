pragma solidity ^0.5.0;

contract EternalStorage {
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
}
