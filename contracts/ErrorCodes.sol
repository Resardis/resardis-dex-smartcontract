pragma solidity ^0.5.17;

contract ErrorCodes {
    // S Series = Security/Authorization
    string internal constant _S101 = "S101_NOT_AUTHORIZED";
    string internal constant _S102 = "S102_REENTRANCY_ATTEMPT";
    // F Series = Funds
    string internal constant _F101 = "F101_BALANCE_NOT_ENOUGH";
    string internal constant _F102 = "F102_ADDRESS_CANT_BE_0";
    string internal constant _F103 = "F103_TOKEN_NOT_ALLOWED";
    string internal constant _F104 = "F104_TRANSFER_FAILED";
    // T Series = Trades/Offers
    string internal constant _T101 = "T101_OFFER_NOT_PRESENT";
    string internal constant _T102 = "T102_OFFER_ID_NOT_VALID";
    string internal constant _T103 = "T103_OFFER_TYPE_NOT_VALID";
    string internal constant _T104 = "T104_OFFER_AMOUNT_LOW";
    string internal constant _T105 = "T105_OFFER_AMOUNT_HIGH";
    string internal constant _T106 = "T106_OFFER_AMOUNT_NOT_VALID";
    string internal constant _T107 = "T107_TOKENS_CANT_BE_THE_SAME";
    string internal constant _T108 = "T108_NOT_ENOUGH_OFFERS_PRESENT";
    string internal constant _T109 = "T109_BUY_FAILED";
    string internal constant _T110 = "T110_UNSORT_FAILED";
    string internal constant _T111 = "T111_FILL_AMOUNT_LOW";
    string internal constant _T112 = "T112_FILL_AMOUNT_HIGH";
}
