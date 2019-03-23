'use strict';

const erc20 = artifacts.require('ERC20');

module.exports = function (deployer, network, accounts) {
  if (network == 'development') { // eslint-disable-line
    deployer.deploy(erc20);
  }
};
