'use strict';

const Resardis = artifacts.require('Resardis');

module.exports = function (deployer, network, accounts) {
  if (network == 'development') { // eslint-disable-line
    const admin = accounts[0];
    const feeAccount = accounts[1];
    const feeMake = web3.utils.toBN(web3.utils.toWei('0.002', 'ether'));
    const feeTake = web3.utils.toBN(web3.utils.toWei('0.002', 'ether'));
    const feeRebate = web3.utils.toBN(web3.utils.toWei('0.002', 'ether'));
    const noFeeUntil = web3.utils.toBN(1765497600);
    deployer.deploy(Resardis, admin, feeAccount, feeMake, feeTake, feeRebate, noFeeUntil);
  }
};
