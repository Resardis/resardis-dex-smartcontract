'use strict';

const Resardis = artifacts.require('Resardis');

module.exports = function (deployer, network, accounts) {
  if (network === 'ganache_local') {
    const admin = accounts[0];
    const feeAccount = accounts[0];
    const feeMake = web3.utils.toBN(web3.utils.toWei('0.0015', 'ether'));
    const feeTake = web3.utils.toBN(web3.utils.toWei('0.0025', 'ether'));
    const resardisTokenFee = web3.utils.toBN(web3.utils.toWei('0.47', 'ether'));
    const noFeeUntil = web3.utils.toBN(1765497600);
    deployer.deploy(Resardis, admin, feeAccount, feeMake, feeTake, resardisTokenFee, noFeeUntil);
  }
};
