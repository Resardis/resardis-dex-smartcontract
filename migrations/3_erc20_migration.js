'use strict';

const erc20 = artifacts.require('ERC20Mintable');

module.exports = function (deployer, network, accounts) {
  if (network == 'development') { // eslint-disable-line
    deployer.deploy(erc20);
  }
};
