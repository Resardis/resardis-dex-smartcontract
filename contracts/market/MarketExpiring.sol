/// expiring_market.sol
// Copyright (C) 2016 - 2020 Maker Ecosystem Growth Holdings, INC.

//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

pragma solidity ^0.5.17;

import "../vendor/dapphub/DSAuth.sol";
import "./MarketBase.sol";

// Simple Market with a market lifetime. When the closeTime has been reached,
// offers can only be cancelled (offer and buy will throw).

contract ExpiringMarket is DSAuth, SimpleMarket {
    uint64 public closeTime;
    bool public stopped;

    // after closeTime has been reached, no new offers are allowed
    modifier can_offer {
        require(!isClosed());
        _;
    }

    // after close, no new buys are allowed
    modifier can_buy(uint id) {
        require(isActive(id));
        require(!isClosed());
        _;
    }

    // after close, anyone can cancel an offer
    modifier can_cancel(uint id) {
        require(isActive(id));
        require((msg.sender == getOwner(id)) || isClosed());
        _;
    }

    function isClosed() public view returns (bool closed) {
        return stopped || getTime() > closeTime;
    }

    function getTime() public view returns (uint64) {
        return uint64(now); // solhint-disable-line not-rely-on-time
    }

    function stop() public auth {
        stopped = true;
    }
}
