'use strict';

const resardistoken = artifacts.require('ERC20Mintable2');

module.exports = function (deployer, network, accounts) {
  if (network == 'ganache_local') { // eslint-disable-line
    deployer.deploy(resardistoken);
  }
};
