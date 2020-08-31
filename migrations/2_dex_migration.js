'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20MintableX');

module.exports = async (deployer, network, accounts) => {
  if (network === 'ganache_local') {
    const admin = accounts[0];
    console.log('Admin Account Address: ' + admin.toString());
    deployer.deploy(Resardis, admin);
  } else if (network === 'matic_testnet') {
    const admin = accounts[0];
    const secAccount = accounts[1];
    const thirdAccount = accounts[2];

    console.log('Admin Account Address: ' + admin.toString());
    console.log('Secondary Account Address: ' + secAccount.toString());
    console.log('Third Account Address: ' + thirdAccount.toString());

    const addressZero = web3.utils.toChecksumAddress('0x0000000000000000000000000000000000000000');

    const mintAmount = web3.utils.toBN(web3.utils.toWei('10.00', 'ether'));

    const depAmountEth = web3.utils.toBN(web3.utils.toWei('1.35', 'ether'));
    const depAmountERC = web3.utils.toBN(web3.utils.toWei('3.95', 'ether'));

    let amountGetSec = web3.utils.toBN(web3.utils.toWei('0.0020', 'ether'));
    let amountGiveSec = web3.utils.toBN(web3.utils.toWei('0.0013', 'ether'));

    let amountGetThird = web3.utils.toBN(web3.utils.toWei('0.0008', 'ether'));
    let amountGiveThird = web3.utils.toBN(web3.utils.toWei('0.0015', 'ether'));

    console.log('DEPLOY AND MINT TEST ERC20');
    await deployer.deploy(erc20);
    const tokenInstance = await erc20.deployed();
    await tokenInstance.addMinter(thirdAccount, { from: admin });
    await tokenInstance.mint(thirdAccount, mintAmount, { from: admin, value: 0 });
    const tokenAddress = web3.utils.toChecksumAddress(tokenInstance.address);
    console.log('Token Address = ', tokenAddress.toString());

    console.log('DEPLOY DEX');
    await deployer.deploy(Resardis, admin);
    const dexInstance = await Resardis.deployed();
    const dexAddress = web3.utils.toChecksumAddress(dexInstance.address);

    console.log('SETTING OFFER TYPES');
    // Allow Limit Order
    await dexInstance.setOfferType(0, true, { from: admin });
    // Allow Market Order
    await dexInstance.setOfferType(1, true, { from: admin });

    console.log('DEPOSITING AMOUNTS');
    // Deposit test erc20
    await tokenInstance.approve(
      dexAddress, depAmountERC, { from: thirdAccount, value: 0 },
    );
    await dexInstance.depositToken(
      tokenAddress, depAmountERC, { from: thirdAccount, value: 0 },
    );

    // Deposit some ETH
    await dexInstance.deposit({ from: secAccount, value: depAmountEth });

    console.log('GIVING DUMMY ORDERS');
    // Fill with dummy Limit orders
    let i;
    for (i = 0; i < 50; i++) {
      amountGetSec = amountGetSec.add(
        web3.utils.toBN(web3.utils.toWei('0.0003', 'ether')),
      );
      amountGiveSec = amountGiveSec.add(
        web3.utils.toBN(web3.utils.toWei('0.0002', 'ether')),
      );

      amountGetThird = amountGetThird.add(
        web3.utils.toBN(web3.utils.toWei('0.00028', 'ether')),
      );
      amountGiveThird = amountGiveThird.add(
        web3.utils.toBN(web3.utils.toWei('0.0003', 'ether')),
      );

      console.log('DUMMY ORDER NO = ', i.toString());

      // Give Ethereum, Get Matic Test ERC20
      await dexInstance.offer(
        amountGiveSec, addressZero, amountGetSec, tokenAddress, 0, true, 0,
        { from: secAccount, value: 0 },
      );

      // Give Matic Test ERC20, Get Ethereum
      await dexInstance.offer(
        amountGiveThird, tokenAddress, amountGetThird, addressZero, 0, true, 0,
        { from: thirdAccount, value: 0 },
      );
    }
  }
};
