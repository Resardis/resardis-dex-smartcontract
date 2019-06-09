'use strict';

const resardistoken = artifacts.require('ERC20Mintable2');

module.exports = function (deployer, network, accounts) {
  if (network == 'development') { // eslint-disable-line
    deployer.deploy(resardistoken);
  }
};
