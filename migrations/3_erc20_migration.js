'use strict';

const erc20 = artifacts.require('ERC20MintableX');
const resardistoken = artifacts.require('ERC20MintableY');

module.exports = async (deployer, network, accounts) => {
  if (network === 'ganache_local') {
    await deployer.deploy(erc20);
    await deployer.deploy(resardistoken);
  } else if (network === 'rinkeby') {
    const mintAmount = web3.utils.toBN(web3.utils.toWei('1000', 'ether'));
    const minterAccount = accounts[0];
    console.log('Minter Account Address: ' + minterAccount.toString());
    await deployer.deploy(erc20);
    const tokenInstance = await erc20.deployed();
    await tokenInstance.mint(minterAccount, mintAmount);
  }
};
