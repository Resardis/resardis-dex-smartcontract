pragma solidity ^0.5.0;

import "../vendor/ERC20Mintable.sol";

contract ERC20MintableX is ERC20Mintable {
    string public name = "ERC20X";
    string public symbol = "ERCX";
    uint8 public decimals = 18;
}

contract ERC20MintableY is ERC20Mintable {
    string public name = "ERC20Y";
    string public symbol = "ERCY";
    uint8 public decimals = 18;
}