'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20Mintable');

contract('TestResardis-Trading', async accounts => {
  let addressZero;
  let initMinter;
  let firstAccount;
  let secAccount;
  let depAmountEth;
  let depAmountToken;
  let amountGet;
  let amountGive;
  let tradeAmount;
  let mintAmount;
  let expiryIncrement;
  let dexInstance;
  let tokenInstance;
  let dexAddress;
  let tokenAddress;
  let feeAccount;

  beforeEach('Assign Trading variables', async () => {
    addressZero = web3.utils.toChecksumAddress('0x0000000000000000000000000000000000000000');
    initMinter = accounts[0];
    firstAccount = accounts[6];
    secAccount = accounts[7];
    depAmountEth = web3.utils.toBN(web3.utils.toWei('43.5', 'ether'));
    depAmountToken = web3.utils.toBN(web3.utils.toWei('90.5', 'ether'));
    amountGet = web3.utils.toBN(web3.utils.toWei('20.4', 'ether'));
    amountGive = web3.utils.toBN(web3.utils.toWei('10.8', 'ether'));
    tradeAmount = amountGet;
    mintAmount = web3.utils.toBN(web3.utils.toWei('500', 'ether'));
    expiryIncrement = web3.utils.toBN('50'); // added to the blockNumber to set the expiry
    dexInstance = await Resardis.deployed();
    tokenInstance = await erc20.deployed();
    dexAddress = web3.utils.toChecksumAddress(dexInstance.address);
    tokenAddress = web3.utils.toChecksumAddress(tokenInstance.address);
    feeAccount = await dexInstance.feeAccount.call();
  });

  it('Try to place an order, then cancel it, and succeed', async () => {
    // deposit some ETH
    const initBalance = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    await dexInstance.deposit({ from: firstAccount, value: depAmountEth });
    const finalBalance = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    const supposedBalance = initBalance.add(depAmountEth);
    // Order to be expired after X blocks from the last block
    let blockNumber = await web3.eth.getBlockNumber();
    blockNumber = web3.utils.toBN(blockNumber);
    const expires = blockNumber.add(expiryIncrement);
    const orderNonce = web3.utils.toBN('1');
    // place the order
    await dexInstance.order(
      tokenAddress, amountGet, addressZero, amountGive, expires,
      orderNonce, { from: firstAccount, value: 0 }
    );
    // check how much of the order volume is available and/or filled
    const availableFirst = await dexInstance.availableVolume(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    const filledFirst = await dexInstance.amountFilled(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    // cancel the order
    await dexInstance.cancelOrder(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      0, '0x0', '0x0', { from: firstAccount, value: 0 }
    );
    // check order volume again
    const availableSecond = await dexInstance.availableVolume(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    const filledSecond = await dexInstance.amountFilled(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(depAmountEth.toString(), finalBalance.toString());
    assert.equal(supposedBalance.toString(), finalBalance.toString());
    assert.equal(availableFirst.toString(), amountGet.toString());
    assert.equal(filledFirst.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(availableSecond.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(filledSecond.toString(), amountGet.toString());
  });

  it('Try to place an order, then do some trading, and succeed (zero-fee)', async () => {
    // deposit some ETH to firstAccount
    const befDepEthBalFirst = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    await dexInstance.deposit({ from: firstAccount, value: depAmountEth });
    const aftDepEthBalFirst = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    const initTokenBalFirst = await dexInstance.balanceOf(tokenAddress, firstAccount, { from: firstAccount });
    // mint & deposit some tokens to secAccount
    await tokenInstance.mint(secAccount, mintAmount, { from: initMinter, value: 0 });
    const befDepTokenBalSec = await dexInstance.balanceOf(tokenAddress, secAccount, { from: secAccount });
    await tokenInstance.approve(dexAddress, depAmountToken, { from: secAccount, value: 0 });
    await dexInstance.depositToken(tokenAddress, depAmountToken, { from: secAccount, value: 0 });
    const aftDepTokenBalSec = await dexInstance.balanceOf(tokenAddress, secAccount, { from: secAccount });
    const initEthBalSec = await dexInstance.balanceOf(addressZero, secAccount, { from: secAccount });
    // Check initial amounts in the fee account
    const initEthBalFeeAcc = await dexInstance.balanceOf(addressZero, feeAccount, { from: firstAccount });
    const initTokenBalFeeAcc = await dexInstance.balanceOf(tokenAddress, feeAccount, { from: firstAccount });
    // place an order
    let blockNumber = await web3.eth.getBlockNumber();
    blockNumber = web3.utils.toBN(blockNumber);
    const expires = blockNumber.add(expiryIncrement);
    const orderNonce = web3.utils.toBN('2');
    await dexInstance.order(
      tokenAddress, amountGet, addressZero, amountGive, expires,
      orderNonce, { from: firstAccount, value: 0 }
    );
    const availableAfterOrder = await dexInstance.availableVolume(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    const filledAfterOrder = await dexInstance.amountFilled(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    // do trading
    await dexInstance.trade(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', tradeAmount, { from: secAccount, value: 0 }
    );
    // check the order volume again
    const availableAfterTrade = await dexInstance.availableVolume(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );
    const filledAfterTrade = await dexInstance.amountFilled(
      tokenAddress, amountGet, addressZero, amountGive, expires, orderNonce,
      firstAccount, 0, '0x0', '0x0', { from: firstAccount }
    );

    const finTokenBalFirst = await dexInstance.balanceOf(tokenAddress, firstAccount, { from: firstAccount });
    const finEthBalFirst = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    const finTokenBalSec = await dexInstance.balanceOf(tokenAddress, secAccount, { from: secAccount });
    const finEthBalSec = await dexInstance.balanceOf(addressZero, secAccount, { from: secAccount });

    const finEthBalFeeAcc = await dexInstance.balanceOf(addressZero, feeAccount, { from: firstAccount });
    const finTokenBalFeeAcc = await dexInstance.balanceOf(tokenAddress, feeAccount, { from: firstAccount });

    console.log('initEthBalFeeAcc=', initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', finTokenBalFeeAcc.toString());

    console.log('initTokenBalFirst + tradeAmount=', (initTokenBalFirst.add(tradeAmount)).toString());
    console.log('(aftDepEthBalFirst - amountGive=', (aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (initEthBalSec.add(amountGive)).toString());

    console.log('finTokenBalFirst=', finTokenBalFirst.toString());
    console.log('finEthBalFirst=', finEthBalFirst.toString());
    console.log('finTokenBalSec=', finTokenBalSec.toString());
    console.log('finEthBalSec=', finEthBalSec.toString());

    // Check if deposits done correctly
    assert.notEqual(befDepEthBalFirst.toString(), aftDepEthBalFirst.toString());
    assert.equal((befDepEthBalFirst.add(depAmountEth)).toString(), aftDepEthBalFirst.toString());
    assert.notEqual(befDepTokenBalSec.toString(), aftDepTokenBalSec.toString());
    assert.equal((befDepTokenBalSec.add(depAmountToken)).toString(), aftDepTokenBalSec.toString());
    // Compare the available and filled order volumes
    assert.equal(availableAfterOrder.toString(), amountGet.toString());
    assert.equal(filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(finEthBalFirst.toString(), (aftDepEthBalFirst.sub(amountGive)).toString());
    assert.equal(finEthBalSec.toString(), (initEthBalSec.add(amountGive)).toString());
    assert.equal(finTokenBalFirst.toString(), (initTokenBalFirst.add(tradeAmount)).toString());
    assert.equal(finTokenBalSec.toString(), (aftDepTokenBalSec.sub(tradeAmount)).toString());
    // Check the fee accounts
    assert.equal(finEthBalFeeAcc.toString(), (finEthBalFeeAcc.sub(initEthBalFeeAcc)).toString());
    assert.equal(finTokenBalFeeAcc.toString(), (finTokenBalFeeAcc.sub(initTokenBalFeeAcc)).toString());
  });
});
