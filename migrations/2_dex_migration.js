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
    deployer.deploy(Resardis, admin);
  }
};
