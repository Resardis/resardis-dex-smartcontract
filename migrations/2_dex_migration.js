'use strict';

const Resardis = artifacts.require('Resardis');

module.exports = async (deployer, network, accounts) => {
  if (network === 'ganache_local') {
    const admin = accounts[0];
    console.log("Admin Account Address: " + admin.toString());
    deployer.deploy(Resardis, admin);
  }
  else if (network === 'matic_testnet') {
    const admin = accounts[0];
    const secAccount = accounts[1];

    console.log("Admin Account Address: " + admin.toString());
    console.log("Secondary Account Address: " + secAccount.toString());

    const addressZero = web3.utils.toChecksumAddress('0x0000000000000000000000000000000000000000');
    const tokenAddress = web3.utils.toChecksumAddress('0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e'); // Matic Test ERC30

    const depAmountEth = web3.utils.toBN(web3.utils.toWei('0.35', 'ether'));
    let amountGet = web3.utils.toBN(web3.utils.toWei('0.0020', 'ether'));
    let amountGive = web3.utils.toBN(web3.utils.toWei('0.0013', 'ether'));

    await deployer.deploy(Resardis, admin);
    const dexInstance = await Resardis.deployed();

    // Allow Limit Order
    await dexInstance.changeAvailableOfferType(0, true, { from: admin });
    // Allow Market Order
    await dexInstance.changeAvailableOfferType(1, true, { from: admin });
    // Deposit some ETH
    await dexInstance.deposit({ from: secAccount, value: depAmountEth });

    // Fill with dummy Limit orders
    let i;
    for (i = 0; i < 10; i++) {
      amountGet = amountGet.add(web3.utils.toBN(web3.utils.toWei('0.0003', 'ether')));
      amountGive = amountGive.add(web3.utils.toBN(web3.utils.toWei('0.0002', 'ether')));

      await dexInstance.offer(
        amountGive, addressZero, amountGet, tokenAddress, 0, true, 0,
        { from: secAccount, value: 0 },
      );
    }

  }
};
