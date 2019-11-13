pragma solidity ^0.5.0;

import "./vendor/ERC20.sol";

contract ERC20Main is ERC20 {
    string public name = "ERC20Main";
    string public symbol = "ERC20M";
    uint8 public decimals = 18;

    // one billion in initial supply
    uint256 public constant INITIAL_SUPPLY = 1000000000;

    constructor() public {
        totalSupply_ = INITIAL_SUPPLY * (10 ** uint256(decimals));
        balances[msg.sender] = totalSupply_;
    }
}
