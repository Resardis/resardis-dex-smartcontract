'use strict';

const Resardis = artifacts.require('Resardis');

// module.exports = function (deployer, network, accounts) {
//   if (network === 'ganache_local') {
//     deployer.deploy(Resardis);
//   }
// };

module.exports = function (deployer, network, accounts) {
  if (network === 'ganache_local') {
    const admin = accounts[0];
    const close_time = web3.utils.toBN(2145916800); // 2038
    deployer.deploy(Resardis, admin, close_time);
  }
};
