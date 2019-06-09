'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20Mintable');
const resToken = artifacts.require('ERC20Mintable2');

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
  let resTokenInstance;
  let dexAddress;
  let tokenAddress;
  let feeAccount;
  let earlyDate;
  let resTokenAddress;

  beforeEach('Assign Trading variables', async () => {
    addressZero = web3.utils.toChecksumAddress('0x0000000000000000000000000000000000000000');
    initMinter = accounts[0];
    firstAccount = accounts[6];
    secAccount = accounts[7];
    depAmountEth = web3.utils.toBN(web3.utils.toWei('13.5', 'ether'));
    depAmountToken = web3.utils.toBN(web3.utils.toWei('48.5', 'ether'));
    amountGet = web3.utils.toBN(web3.utils.toWei('12.4', 'ether'));
    amountGive = web3.utils.toBN(web3.utils.toWei('7.8', 'ether'));
    tradeAmount = amountGet;
    mintAmount = web3.utils.toBN(web3.utils.toWei('500', 'ether'));
    expiryIncrement = web3.utils.toBN('50'); // added to the blockNumber to set the expiry
    dexInstance = await Resardis.deployed();
    tokenInstance = await erc20.deployed();
    resTokenInstance = await resToken.deployed();
    dexAddress = web3.utils.toChecksumAddress(dexInstance.address);
    tokenAddress = web3.utils.toChecksumAddress(tokenInstance.address);
    resTokenAddress = web3.utils.toChecksumAddress(resTokenInstance.address);
    feeAccount = await dexInstance.feeAccount.call();
    earlyDate = web3.utils.toBN(788918400); // 1995/01/01
  });

  // tradeFlow function to be used to test trading with zero and non-zero fees
  async function tradeFlow (nonce) {
    // admin define the resTokenAddress
    const currentAdmin = await dexInstance.admin.call();
    await dexInstance.setResardisTokenAddress(resTokenAddress, { from: currentAdmin });
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
    // mint & deposit some resTokens to firstAccount
    await resTokenInstance.mint(firstAccount, mintAmount, { from: initMinter, value: 0 });
    const befDepResTokenBalFirst = await dexInstance.balanceOf(resTokenAddress, firstAccount, { from: firstAccount });
    await resTokenInstance.approve(dexAddress, depAmountToken, { from: firstAccount, value: 0 });
    await dexInstance.depositToken(resTokenAddress, depAmountToken, { from: firstAccount, value: 0 });
    const aftDepResTokenBalFirst = await dexInstance.balanceOf(resTokenAddress, firstAccount, { from: firstAccount });
    // mint & deposit some resTokens to secAccount
    await resTokenInstance.mint(secAccount, mintAmount, { from: initMinter, value: 0 });
    const befDepResTokenBalSec = await dexInstance.balanceOf(resTokenAddress, secAccount, { from: secAccount });
    await resTokenInstance.approve(dexAddress, depAmountToken, { from: secAccount, value: 0 });
    await dexInstance.depositToken(resTokenAddress, depAmountToken, { from: secAccount, value: 0 });
    const aftDepResTokenBalSec = await dexInstance.balanceOf(resTokenAddress, secAccount, { from: secAccount });
    // Check initial amounts in the fee account
    const initEthBalFeeAcc = await dexInstance.balanceOf(addressZero, feeAccount, { from: firstAccount });
    const initTokenBalFeeAcc = await dexInstance.balanceOf(tokenAddress, feeAccount, { from: firstAccount });
    const initResTokenBalFeeAcc = await dexInstance.balanceOf(resTokenAddress, feeAccount, { from: firstAccount });
    // place an order
    let blockNumber = await web3.eth.getBlockNumber();
    blockNumber = web3.utils.toBN(blockNumber);
    const expires = blockNumber.add(expiryIncrement);
    const orderNonce = web3.utils.toBN(nonce);
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
    const finResTokenBalFirst = await dexInstance.balanceOf(resTokenAddress, firstAccount, { from: firstAccount });

    const finTokenBalSec = await dexInstance.balanceOf(tokenAddress, secAccount, { from: secAccount });
    const finEthBalSec = await dexInstance.balanceOf(addressZero, secAccount, { from: secAccount });
    const finResTokenBalSec = await dexInstance.balanceOf(resTokenAddress, secAccount, { from: secAccount });

    const finEthBalFeeAcc = await dexInstance.balanceOf(addressZero, feeAccount, { from: firstAccount });
    const finTokenBalFeeAcc = await dexInstance.balanceOf(tokenAddress, feeAccount, { from: firstAccount });
    const finResTokenBalFeeAcc = await dexInstance.balanceOf(resTokenAddress, feeAccount, { from: firstAccount });

    return {
      befDepEthBalFirst,
      aftDepEthBalFirst,
      befDepTokenBalSec,
      aftDepTokenBalSec,
      befDepResTokenBalSec,
      befDepResTokenBalFirst,
      aftDepResTokenBalFirst,
      aftDepResTokenBalSec,
      availableAfterOrder,
      filledAfterOrder,
      availableAfterTrade,
      filledAfterTrade,
      finEthBalFirst,
      finEthBalSec,
      finResTokenBalFirst,
      finResTokenBalSec,
      initEthBalSec,
      finTokenBalFirst,
      initTokenBalFirst,
      finTokenBalSec,
      finEthBalFeeAcc,
      initEthBalFeeAcc,
      initResTokenBalFeeAcc,
      finResTokenBalFeeAcc,
      finTokenBalFeeAcc,
      initTokenBalFeeAcc,
    };
  }

  it('Place an order, cancel it, and succeed. No fee option set.', async () => {
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

  it('Place an order, do trading, and succeed. Zero-fee. No fee option set.', async () => {
    const initFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });

    const out = await tradeFlow('2');
    console.log('===== FEE ACCOUNT INFO =====');
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initResTokenBalFeeAcc=', out.initResTokenBalFeeAcc.toString());
    console.log('finResTokenBalFeeAcc=', out.finResTokenBalFeeAcc.toString());
    console.log('===== FIRST USER ACCOUNT INFO =====');
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepresTokenBalFirst=', out.befDepResTokenBalFirst.toString());
    console.log('aftDepResTokenBalFirst=', out.aftDepResTokenBalFirst.toString());
    console.log('===== SECOND USER ACCOUNT INFO =====');
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepResTokenBalSec=', out.befDepResTokenBalSec.toString());
    console.log('aftDepResTokenBalSec=', out.aftDepResTokenBalSec.toString());
    console.log('===================================');
    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());
    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check if fee as resardis token option is false
    assert.isFalse(initFirstAccountFeeOption);
    assert.isFalse(initSecAccountFeeOption);
    // Check if deposits done correctly
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalSec.add(depAmountToken)).toString(), out.aftDepResTokenBalSec.toString());
    assert.notEqual(out.befDepResTokenBalSec.toString(), out.aftDepResTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalFirst.add(depAmountToken)).toString(), out.aftDepResTokenBalFirst.toString());
    assert.notEqual(out.befDepResTokenBalFirst.toString(), out.aftDepResTokenBalFirst.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.notEqual(out.finEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.notEqual(out.finEthBalSec.toString(), out.initEthBalSec.toString());
    assert.equal(out.finTokenBalFirst.toString(), (out.initTokenBalFirst.add(tradeAmount)).toString());
    assert.notEqual(out.finTokenBalFirst.toString(), out.initTokenBalFirst.toString());
    assert.equal(out.finTokenBalSec.toString(), (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    assert.notEqual(out.finTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), out.initTokenBalFeeAcc.toString());
    assert.equal(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.toString());
  });

  it('Place an order, do trading, and succeed. Non-zero-fee. No fee option set.', async () => {
    // change the fees
    const currentAdmin = await dexInstance.admin.call();
    const oldNoFeeUntil = await dexInstance.noFeeUntil.call();
    await dexInstance.changeNoFeeUntil(earlyDate, { from: currentAdmin });
    const newNoFeeUntil = await dexInstance.noFeeUntil.call();

    const unit = web3.utils.toBN(web3.utils.toWei('1.0', 'ether'));
    let feeMake = await dexInstance.feeMake.call();
    feeMake = (feeMake.mul(tradeAmount)).div(unit);
    let feeTake = await dexInstance.feeTake.call();
    feeTake = (feeTake.mul(tradeAmount)).div(unit);
    const totalFee = feeMake.add(feeTake);

    const initFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('3');
    console.log('===== FEE INFO =====');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('===== FEE ACCOUNT INFO =====');
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initResTokenBalFeeAcc=', out.initResTokenBalFeeAcc.toString());
    console.log('finResTokenBalFeeAcc=', out.finResTokenBalFeeAcc.toString());
    console.log('===== FIRST USER ACCOUNT INFO =====');
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepResTokenBalFirst=', out.befDepResTokenBalFirst.toString());
    console.log('aftDepResTokenBalFirst=', out.aftDepResTokenBalFirst.toString());
    console.log('===== SECOND USER ACCOUNT INFO =====');
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepResTokenBalSec=', out.befDepResTokenBalSec.toString());
    console.log('aftDepResTokenBalSec=', out.aftDepResTokenBalSec.toString());
    console.log('===================================');
    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());
    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check if fee as resardis token option is false
    assert.isFalse(initFirstAccountFeeOption);
    assert.isFalse(initSecAccountFeeOption);
    // Check the zero-fee period change
    assert.notEqual(oldNoFeeUntil.toString(), newNoFeeUntil.toString());
    assert.equal(earlyDate.toString(), newNoFeeUntil.toString());
    // Check if deposits done correctly
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalSec.add(depAmountToken)).toString(), out.aftDepResTokenBalSec.toString());
    assert.notEqual(out.befDepResTokenBalSec.toString(), out.aftDepResTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalFirst.add(depAmountToken)).toString(), out.aftDepResTokenBalFirst.toString());
    assert.notEqual(out.befDepResTokenBalFirst.toString(), out.aftDepResTokenBalFirst.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.notEqual(out.finEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.notEqual(out.finEthBalSec.toString(), out.initEthBalSec.toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount)).sub(feeMake)).toString());
    assert.notEqual(out.finTokenBalFirst.toString(), out.initTokenBalFirst.toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount)).sub(feeTake)).toString());
    assert.notEqual(out.finTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), (totalFee.add(out.initTokenBalFeeAcc)).toString());
    assert.notEqual(out.finTokenBalFeeAcc.toString(), out.initTokenBalFeeAcc.toString());
    assert.equal(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.toString());
  });

  it('Place an order, do trading, and succeed. Non-zero-fee. Fees as Resardis Token for ETH giver.', async () => {
    // change the no-fee period
    const currentAdmin = await dexInstance.admin.call();
    await dexInstance.changeNoFeeUntil(earlyDate, { from: currentAdmin });
    const newNoFeeUntil = await dexInstance.noFeeUntil.call();

    const unit = web3.utils.toBN(web3.utils.toWei('1.0', 'ether'));
    let feeMake = await dexInstance.feeMake.call();
    feeMake = (feeMake.mul(tradeAmount)).div(unit);
    let feeTake = await dexInstance.feeTake.call();
    feeTake = (feeTake.mul(tradeAmount)).div(unit);
    const resTokenFee = await dexInstance.resardisTokenFee.call();
    // users change their Options
    const initFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });
    await dexInstance.changeFeeOption(firstAccount, true, { from: firstAccount });
    await dexInstance.changeFeeOption(secAccount, false, { from: secAccount });
    const finalFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('4');
    console.log('===== FEE INFO =====');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('resTokenFee=', resTokenFee.toString());
    console.log('===== FEE ACCOUNT INFO =====');
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initResTokenBalFeeAcc=', out.initResTokenBalFeeAcc.toString());
    console.log('finResTokenBalFeeAcc=', out.finResTokenBalFeeAcc.toString());
    console.log('===== FIRST USER ACCOUNT INFO =====');
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalFirstAccountFeeOption=', finalFirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepResTokenBalFirst=', out.befDepResTokenBalFirst.toString());
    console.log('aftDepResTokenBalFirst=', out.aftDepResTokenBalFirst.toString());
    console.log('===== SECOND USER ACCOUNT INFO =====');
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepResTokenBalSec=', out.befDepResTokenBalSec.toString());
    console.log('aftDepResTokenBalSec=', out.aftDepResTokenBalSec.toString());
    console.log('===================================');
    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());
    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check the zero-fee period change
    assert.equal(earlyDate.toString(), newNoFeeUntil.toString());
    // Check if fee option changed correctly
    assert.notEqual(initFirstAccountFeeOption.toString(), finalFirstAccountFeeOption.toString());
    assert.strictEqual(initSecAccountFeeOption, finalSecAccountFeeOption);
    assert.isTrue(finalFirstAccountFeeOption);
    assert.isFalse(finalSecAccountFeeOption);
    assert.notEqual(finalFirstAccountFeeOption, finalSecAccountFeeOption);
    // Check if deposits done correctly
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalSec.add(depAmountToken)).toString(), out.aftDepResTokenBalSec.toString());
    assert.notEqual(out.befDepResTokenBalSec.toString(), out.aftDepResTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalFirst.add(depAmountToken)).toString(), out.aftDepResTokenBalFirst.toString());
    assert.notEqual(out.befDepResTokenBalFirst.toString(), out.aftDepResTokenBalFirst.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.notEqual(out.finEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.notEqual(out.finEthBalSec.toString(), out.initEthBalSec.toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount))).toString());
    assert.notEqual(out.finTokenBalFirst.toString(), out.initTokenBalFirst.toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount)).sub(feeTake)).toString());
    assert.notEqual(out.finTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal(out.finResTokenBalFirst.toString(), ((out.aftDepResTokenBalFirst.sub(resTokenFee))).toString());
    assert.notEqual(out.finResTokenBalFirst.toString(), out.aftDepResTokenBalFirst.toString());
    assert.equal(out.finResTokenBalSec.toString(), out.aftDepResTokenBalSec.toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), (feeTake.add(out.initTokenBalFeeAcc)).toString());
    assert.notEqual(out.finTokenBalFeeAcc.toString(), out.initTokenBalFeeAcc.toString());
    assert.equal(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.add(resTokenFee).toString());
    assert.notEqual(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.toString());
  });

  it('Place an order, do trading, and succeed. Non-zero-fee. Fees as Resardis Token for ETH taker.', async () => {
    // change the no-fee period
    const currentAdmin = await dexInstance.admin.call();
    await dexInstance.changeNoFeeUntil(earlyDate, { from: currentAdmin });
    const newNoFeeUntil = await dexInstance.noFeeUntil.call();

    const unit = web3.utils.toBN(web3.utils.toWei('1.0', 'ether'));
    let feeMake = await dexInstance.feeMake.call();
    feeMake = (feeMake.mul(tradeAmount)).div(unit);
    let feeTake = await dexInstance.feeTake.call();
    feeTake = (feeTake.mul(tradeAmount)).div(unit);
    const resTokenFee = await dexInstance.resardisTokenFee.call();
    // users change their Options
    const initFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });
    await dexInstance.changeFeeOption(firstAccount, false, { from: firstAccount });
    await dexInstance.changeFeeOption(secAccount, true, { from: secAccount });
    const finalFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('5');
    console.log('===== FEE INFO =====');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('resTokenFee=', resTokenFee.toString());
    console.log('===== FEE ACCOUNT INFO =====');
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initResTokenBalFeeAcc=', out.initResTokenBalFeeAcc.toString());
    console.log('finResTokenBalFeeAcc=', out.finResTokenBalFeeAcc.toString());
    console.log('===== FIRST USER ACCOUNT INFO =====');
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalFirstAccountFeeOption=', finalFirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepResTokenBalFirst=', out.befDepResTokenBalFirst.toString());
    console.log('aftDepResTokenBalFirst=', out.aftDepResTokenBalFirst.toString());
    console.log('===== SECOND USER ACCOUNT INFO =====');
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepResTokenBalSec=', out.befDepResTokenBalSec.toString());
    console.log('aftDepResTokenBalSec=', out.aftDepResTokenBalSec.toString());
    console.log('===================================');
    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());
    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check the zero-fee period change
    assert.equal(earlyDate.toString(), newNoFeeUntil.toString());
    // Check if fee option changed correctly
    assert.notEqual(initFirstAccountFeeOption.toString(), finalFirstAccountFeeOption.toString());
    assert.notEqual(initSecAccountFeeOption.toString(), finalSecAccountFeeOption.toString());
    assert.isFalse(finalFirstAccountFeeOption);
    assert.isTrue(finalSecAccountFeeOption);
    assert.notEqual(finalFirstAccountFeeOption, finalSecAccountFeeOption);
    // Check if deposits done correctly
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalSec.add(depAmountToken)).toString(), out.aftDepResTokenBalSec.toString());
    assert.notEqual(out.befDepResTokenBalSec.toString(), out.aftDepResTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalFirst.add(depAmountToken)).toString(), out.aftDepResTokenBalFirst.toString());
    assert.notEqual(out.befDepResTokenBalFirst.toString(), out.aftDepResTokenBalFirst.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.notEqual(out.finEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.notEqual(out.finEthBalSec.toString(), out.initEthBalSec.toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount)).sub(feeMake)).toString());
    assert.notEqual(out.finTokenBalFirst.toString(), out.initTokenBalFirst.toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount))).toString());
    assert.notEqual(out.finTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), (feeMake.add(out.initTokenBalFeeAcc)).toString());
    assert.notEqual(out.finTokenBalFeeAcc.toString(), out.initTokenBalFeeAcc.toString());
    assert.equal(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.add(resTokenFee).toString());
    assert.notEqual(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.toString());
  });

  it('Place an order, do trading, and succeed. Non-zero-fee. Fees as Resardis Token for both accounts.', async () => {
    // change the no-fee period
    const currentAdmin = await dexInstance.admin.call();
    await dexInstance.changeNoFeeUntil(earlyDate, { from: currentAdmin });
    const newNoFeeUntil = await dexInstance.noFeeUntil.call();

    const unit = web3.utils.toBN(web3.utils.toWei('1.0', 'ether'));
    let feeMake = await dexInstance.feeMake.call();
    feeMake = (feeMake.mul(tradeAmount)).div(unit);
    let feeTake = await dexInstance.feeTake.call();
    feeTake = (feeTake.mul(tradeAmount)).div(unit);
    const resTokenFee = await dexInstance.resardisTokenFee.call();
    const doubleResTokenFee = resTokenFee.add(resTokenFee);
    // users change their Options
    const initFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });
    await dexInstance.changeFeeOption(firstAccount, true, { from: firstAccount });
    await dexInstance.changeFeeOption(secAccount, true, { from: secAccount });
    const finalFirstAccountFeeOption = await dexInstance.getFeeOption(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.getFeeOption(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('6');
    console.log('===== FEE INFO =====');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('resTokenFee=', resTokenFee.toString());
    console.log('===== FEE ACCOUNT INFO =====');
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initResTokenBalFeeAcc=', out.initResTokenBalFeeAcc.toString());
    console.log('finResTokenBalFeeAcc=', out.finResTokenBalFeeAcc.toString());
    console.log('===== FIRST USER ACCOUNT INFO =====');
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalFirstAccountFeeOption=', finalFirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepResTokenBalFirst=', out.befDepResTokenBalFirst.toString());
    console.log('aftDepResTokenBalFirst=', out.aftDepResTokenBalFirst.toString());
    console.log('===== SECOND USER ACCOUNT INFO =====');
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepResTokenBalSec=', out.befDepResTokenBalSec.toString());
    console.log('aftDepResTokenBalSec=', out.aftDepResTokenBalSec.toString());
    console.log('===================================');
    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());
    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check the zero-fee period change
    assert.equal(earlyDate.toString(), newNoFeeUntil.toString());
    // Check if fee option changed correctly
    assert.notEqual(initFirstAccountFeeOption, finalFirstAccountFeeOption);
    assert.strictEqual(initSecAccountFeeOption, finalSecAccountFeeOption);
    assert.isTrue(finalFirstAccountFeeOption);
    assert.isTrue(finalSecAccountFeeOption);
    // Check if deposits done correctly
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalSec.add(depAmountToken)).toString(), out.aftDepResTokenBalSec.toString());
    assert.notEqual(out.befDepResTokenBalSec.toString(), out.aftDepResTokenBalSec.toString());
    assert.equal((out.befDepResTokenBalFirst.add(depAmountToken)).toString(), out.aftDepResTokenBalFirst.toString());
    assert.notEqual(out.befDepResTokenBalFirst.toString(), out.aftDepResTokenBalFirst.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.notEqual(out.finEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.notEqual(out.finEthBalSec.toString(), out.initEthBalSec.toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount))).toString());
    assert.notEqual(out.finTokenBalFirst.toString(), out.initTokenBalFirst.toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount))).toString());
    assert.notEqual(out.finTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal(out.finResTokenBalFirst.toString(), ((out.aftDepResTokenBalFirst.sub(resTokenFee))).toString());
    assert.notEqual(out.finResTokenBalFirst.toString(), out.aftDepResTokenBalFirst.toString());
    assert.equal(out.finResTokenBalSec.toString(), ((out.aftDepResTokenBalSec.sub(resTokenFee))).toString());
    assert.notEqual(out.finResTokenBalSec.toString(), out.aftDepResTokenBalSec.toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), out.initTokenBalFeeAcc.toString());
    assert.equal(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.add(doubleResTokenFee).toString());
    assert.notEqual(out.finResTokenBalFeeAcc.toString(), out.initResTokenBalFeeAcc.toString());
  });
});
