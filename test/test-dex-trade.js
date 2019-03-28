'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20Mintable');

contract('TestResardis-Trading', async accounts => {
  let addressZero;
  let firstAccount;
  // let secAccount;
  let depAmount;
  let amountGet;
  let amountGive;
  let expiryIncrement;
  let dexInstance;
  let tokenInstance;

  beforeEach('Assign Trading variables', async () => {
    addressZero = '0x0000000000000000000000000000000000000000';
    firstAccount = accounts[6];
    // secAccount = accounts[7];
    depAmount = web3.utils.toBN(web3.utils.toWei('43.5', 'ether'));
    amountGet = web3.utils.toBN(web3.utils.toWei('20.4', 'ether'));
    amountGive = web3.utils.toBN(web3.utils.toWei('10.8', 'ether'));
    expiryIncrement = web3.utils.toBN('10'); // added to the blockNumber to set the expiry
    dexInstance = await Resardis.deployed();
    tokenInstance = await erc20.deployed();
  });

  it('Try to place an order and succeed', async () => {
    const tokenGet = web3.utils.toChecksumAddress(tokenInstance.address);
    const tokenGive = web3.utils.toChecksumAddress(addressZero);
    // deposit some ETH
    const initBalance = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    await dexInstance.deposit({ from: firstAccount, value: depAmount });
    const finalBalance = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    const supposedBalance = initBalance.add(depAmount);
    // Order to be expired after X blocks from the last block
    let blockNumber = await web3.eth.getBlockNumber();
    blockNumber = web3.utils.toBN(blockNumber);
    const expires = blockNumber.add(expiryIncrement);
    const orderNonce = web3.utils.toBN('1');
    // place the order
    await dexInstance.order(
      tokenGet, amountGet, tokenGive, amountGive, expires,
      orderNonce, { from: firstAccount, value: 0 }
    );
    // check how much of the order volume is available and/or filled
    const available = await dexInstance.availableVolume(
      tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    const filled = await dexInstance.amountFilled(
      tokenGet, amountGet, tokenGive, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(depAmount.toString(), finalBalance.toString());
    assert.equal(supposedBalance.toString(), finalBalance.toString());
    assert.equal(available.toString(), amountGet.toString());
    assert.equal(filled.toString(), (web3.utils.toBN('0')).toString());
  });
});
