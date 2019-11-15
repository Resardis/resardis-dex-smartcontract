'use strict';

const erc20 = artifacts.require('ERC20MintableX');
const resardistoken = artifacts.require('ERC20MintableY');
const erc20Loom = artifacts.require('ERC20Loom');

const gatewayAddress = '0xe754d9518bf4a9c63476891ef9AA7d91C8236A5D';

module.exports = async (deployer, network, accounts) => {
  if (network === 'ganache_local') {
    await deployer.deploy(erc20);
    await deployer.deploy(resardistoken);
  } else if (network === 'rinkeby') {
    const mintAmount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'));
    await deployer.deploy(erc20);
    const tokenInstance = await erc20.deployed();
    await tokenInstance.mint(accounts[0], mintAmount);
  } else if (network === 'loom_extdev_plasma_us1') {
    await deployer.deploy(erc20Loom, gatewayAddress);
  }
};
