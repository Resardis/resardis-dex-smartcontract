'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20Mintable');
const resardistoken = artifacts.require('ERC20Mintable2');

contract('TestResardis-Trading-With-Fee-Options', async accounts => {
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
  let resardistokenInstance;
  let dexAddress;
  let tokenAddress;
  let feeAccount;
  let earlyDate;
  let resardistokenAddress;

  beforeEach('Assign Trading variables', async () => {
    addressZero = web3.utils.toChecksumAddress('0x0000000000000000000000000000000000000000');
    initMinter = accounts[0];
    firstAccount = accounts[6];
    secAccount = accounts[7];
    depAmountEth = web3.utils.toBN(web3.utils.toWei('5', 'ether'));
    depAmountToken = web3.utils.toBN(web3.utils.toWei('5', 'ether'));
    amountGet = web3.utils.toBN(web3.utils.toWei('3', 'ether'));
    amountGive = web3.utils.toBN(web3.utils.toWei('1', 'ether'));
    tradeAmount = amountGet;
    mintAmount = web3.utils.toBN(web3.utils.toWei('500', 'ether'));
    expiryIncrement = web3.utils.toBN('50'); // added to the blockNumber to set the expiry
    dexInstance = await Resardis.deployed();
    tokenInstance = await erc20.deployed();
    resardistokenInstance = await resardistoken.deployed();
    dexAddress = web3.utils.toChecksumAddress(dexInstance.address);
    tokenAddress = web3.utils.toChecksumAddress(tokenInstance.address);
    resardistokenAddress = web3.utils.toChecksumAddress(resardistokenInstance.address);
    feeAccount = await dexInstance.feeAccount.call();
    earlyDate = web3.utils.toBN(788918400); // 1995/01/01
  });

  // tradeFlow function to be used to test trading with zero and non-zero fees
  async function tradeFlow (nonce) {
    //admin define the resardistokenAddress
    const currentAdmin = await dexInstance.admin.call();
    await dexInstance.setResardisTokenAddress(resardistokenAddress, { from: currentAdmin });



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
    // mint & deposit some resardistokens to secAccount
    await resardistokenInstance.mint(secAccount, mintAmount, { from: initMinter, value: 0 });
    const befDepresardistokenBalSec = await dexInstance.balanceOf(resardistokenAddress, secAccount, { from: secAccount });
    await resardistokenInstance.approve(dexAddress, depAmountToken, { from: secAccount, value: 0 });
    await dexInstance.depositToken(resardistokenAddress, depAmountToken, { from: secAccount, value: 0 });
    const aftDepresardistokenBalSec = await dexInstance.balanceOf(resardistokenAddress, secAccount, { from: secAccount });
    // mint & deposit some resardistokens to firstAccount
    await resardistokenInstance.mint(firstAccount, mintAmount, { from: initMinter, value: 0 });
    const befDepresardistokenBalFirst = await dexInstance.balanceOf(resardistokenAddress, firstAccount, { from: firstAccount });
    await resardistokenInstance.approve(dexAddress, depAmountToken, { from: firstAccount, value: 0 });
    await dexInstance.depositToken(resardistokenAddress, depAmountToken, { from: firstAccount, value: 0 });
    const aftDepresardistokenBalFirst = await dexInstance.balanceOf(resardistokenAddress, firstAccount, { from: firstAccount });
    // Check initial amounts in the fee account
    const initEthBalFeeAcc = await dexInstance.balanceOf(addressZero, feeAccount, { from: firstAccount });
    const initTokenBalFeeAcc = await dexInstance.balanceOf(tokenAddress, feeAccount, { from: firstAccount });
    const initresardistokenBalFeeAcc = await dexInstance.balanceOf(resardistokenAddress, feeAccount, { from: firstAccount });
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
    const finresardistokenBalFirst = await dexInstance.balanceOf(resardistokenAddress, firstAccount, { from: firstAccount });

    const finTokenBalSec = await dexInstance.balanceOf(tokenAddress, secAccount, { from: secAccount });
    const finEthBalSec = await dexInstance.balanceOf(addressZero, secAccount, { from: secAccount });
    const finresardistokenBalSec = await dexInstance.balanceOf(resardistokenAddress, secAccount, { from: secAccount });

    const finEthBalFeeAcc = await dexInstance.balanceOf(addressZero, feeAccount, { from: firstAccount });
    const finTokenBalFeeAcc = await dexInstance.balanceOf(tokenAddress, feeAccount, { from: firstAccount });
    const finresardistokenBalFeeAcc = await dexInstance.balanceOf(resardistokenAddress, feeAccount, { from: firstAccount });

    return {
      befDepEthBalFirst,
      aftDepEthBalFirst,
      befDepTokenBalSec,
      aftDepTokenBalSec,
      befDepresardistokenBalSec,
      befDepresardistokenBalFirst,
      aftDepresardistokenBalFirst,
      aftDepresardistokenBalSec,
      availableAfterOrder,
      filledAfterOrder,
      availableAfterTrade,
      filledAfterTrade,
      finEthBalFirst,
      finEthBalSec,
      finresardistokenBalFirst,
      finresardistokenBalSec,
      initEthBalSec,
      finTokenBalFirst,
      initTokenBalFirst,
      finTokenBalSec,
      finEthBalFeeAcc,
      initEthBalFeeAcc,
      initresardistokenBalFeeAcc,
      finresardistokenBalFeeAcc,
      finTokenBalFeeAcc,
      initTokenBalFeeAcc,
    };
  }


  it('Try to place an order, then do some trading, and succeed (user has different fee option but there is no fee yet.))', async () => {
    const initFirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });
    await dexInstance.feeOptionSet(firstAccount, true, { from: firstAccount });
    await dexInstance.feeOptionSet(secAccount, false, { from: secAccount });
    const finalDirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });

    const out = await tradeFlow('1');
    console.log('resardistokenAddress=', resardistokenAddress);
    console.log('tokenAddress=', tokenAddress);
    console.log('!!!!!!! FEE ACCOUNT INFO=')
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initresardistokenBalFeeAcc=', out.initresardistokenBalFeeAcc.toString());
    console.log('finresardistokenBalFeeAcc=', out.finresardistokenBalFeeAcc.toString());
    console.log(' ')
    console.log('!!!!!!! FIRST USER ACCOUNT INFO=')
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalDirstAccountFeeOption=', finalDirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepresardistokenBalFirst=', out.befDepresardistokenBalFirst.toString());
    console.log('aftDepresardistokenBalFirst=', out.aftDepresardistokenBalFirst.toString());
    console.log(' ')
    console.log('!!!!!!! SECOND USER ACCOUNT INFO=')
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepresardistokenBalSec=', out.befDepresardistokenBalSec.toString());
    console.log('aftDepresardistokenBalSec=', out.aftDepresardistokenBalSec.toString());
    console.log(' ')
    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());

    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check if deposits done correctly
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepresardistokenBalSec.add(depAmountToken)).toString(), out.aftDepresardistokenBalSec.toString());
    assert.notEqual(out.befDepresardistokenBalSec.toString(), out.aftDepresardistokenBalSec.toString());
    assert.equal((out.befDepresardistokenBalFirst.add(depAmountToken)).toString(), out.aftDepresardistokenBalFirst.toString());
    assert.notEqual(out.befDepresardistokenBalFirst.toString(), out.aftDepresardistokenBalFirst.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.equal(out.finTokenBalFirst.toString(), (out.initTokenBalFirst.add(tradeAmount)).toString());
    assert.equal(out.finTokenBalSec.toString(), (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), out.initTokenBalFeeAcc.toString());
    assert.equal(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.toString())

  });

  it('Try to place an order, then do some trading, and succeed (non-zero-fee) (Both user just want to pay fee normal, no resardistoken)', async () => {
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
    await dexInstance.changeResardisTokenFee("1", { from: currentAdmin });
    const resardistokenFee = await dexInstance.getResardisTokenFee.call();
    // users change their Options
    const initFirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });
    await dexInstance.feeOptionSet(firstAccount, false, { from: firstAccount });
    await dexInstance.feeOptionSet(secAccount, false, { from: secAccount });
    const finalDirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('3');
    console.log('!!!!!!! FEE INFO=');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('resardistokenFee=', resardistokenFee.toString());
    console.log(' ')

    console.log('!!!!!!! FEE ACCOUNT INFO=')
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initresardistokenBalFeeAcc=', out.initresardistokenBalFeeAcc.toString());
    console.log('finresardistokenBalFeeAcc=', out.finresardistokenBalFeeAcc.toString());
    console.log(' ')

    console.log('!!!!!!! FIRST USER ACCOUNT INFO=')
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalDirstAccountFeeOption=', finalDirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepresardistokenBalFirst=', out.befDepresardistokenBalFirst.toString());
    console.log('aftDepresardistokenBalFirst=', out.aftDepresardistokenBalFirst.toString());
    console.log(' ')

    console.log('!!!!!!! SECOND USER ACCOUNT INFO=')
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepresardistokenBalSec=', out.befDepresardistokenBalSec.toString());
    console.log('aftDepresardistokenBalSec=', out.aftDepresardistokenBalSec.toString());
    console.log(' ')

    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());

    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check the zero-fee period change
    assert.notEqual(oldNoFeeUntil.toString(), newNoFeeUntil.toString());
    assert.equal(earlyDate.toString(), newNoFeeUntil.toString());
    // Check if deposits done correctly
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount)).sub(feeMake)).toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount)).sub(feeTake)).toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), (totalFee.add(out.initTokenBalFeeAcc)).toString());
    assert.equal(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.toString())
  });

  it('Try to place an order, then do some trading, and succeed (non-zero-fee) (First user (eth giver) pay resardistoken as fee (instead of token), second user (token given) pay normal fee (token).)', async () => {
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
    await dexInstance.changeResardisTokenFee("1", { from: currentAdmin });
    const resardistokenFee = await dexInstance.getResardisTokenFee.call();
    // users change their Options
    const initFirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });
    await dexInstance.feeOptionSet(firstAccount, true, { from: firstAccount });
    await dexInstance.feeOptionSet(secAccount, false, { from: secAccount });
    const finalDirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('4');
    console.log('!!!!!!! FEE INFO=');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('resardistokenFee=', resardistokenFee.toString());
    console.log(' ')

    console.log('!!!!!!! FEE ACCOUNT INFO=')
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initresardistokenBalFeeAcc=', out.initresardistokenBalFeeAcc.toString());
    console.log('finresardistokenBalFeeAcc=', out.finresardistokenBalFeeAcc.toString());
    console.log(' ')

    console.log('!!!!!!! FIRST USER ACCOUNT INFO=')
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalDirstAccountFeeOption=', finalDirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepresardistokenBalFirst=', out.befDepresardistokenBalFirst.toString());
    console.log('aftDepresardistokenBalFirst=', out.aftDepresardistokenBalFirst.toString());
    console.log(' ')

    console.log('!!!!!!! SECOND USER ACCOUNT INFO=')
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepresardistokenBalSec=', out.befDepresardistokenBalSec.toString());
    console.log('aftDepresardistokenBalSec=', out.aftDepresardistokenBalSec.toString());
    console.log(' ')

    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());

    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check if deposits done correctly
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount))).toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount)).sub(feeTake)).toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), (feeTake.add(out.initTokenBalFeeAcc)).toString());
    assert.notEqual(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.toString())
    assert.equal(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.add(resardistokenFee).toString())
  });
  it('Try to place an order, then do some trading, and succeed (non-zero-fee) (First user normal fee, second user pay resardistoken (instead of token).)', async () => {
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
    await dexInstance.changeResardisTokenFee("1", { from: currentAdmin });
    const resardistokenFee = await dexInstance.getResardisTokenFee.call();
    // users change their Options
    const initFirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });
    await dexInstance.feeOptionSet(firstAccount, false, { from: firstAccount });
    await dexInstance.feeOptionSet(secAccount, true, { from: secAccount });
    const finalDirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('5');
    console.log('!!!!!!! FEE INFO=');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('resardistokenFee=', resardistokenFee.toString());
    console.log(' ')

    console.log('!!!!!!! FEE ACCOUNT INFO=')
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initresardistokenBalFeeAcc=', out.initresardistokenBalFeeAcc.toString());
    console.log('finresardistokenBalFeeAcc=', out.finresardistokenBalFeeAcc.toString());
    console.log(' ')

    console.log('!!!!!!! FIRST USER ACCOUNT INFO=')
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalDirstAccountFeeOption=', finalDirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepresardistokenBalFirst=', out.befDepresardistokenBalFirst.toString());
    console.log('aftDepresardistokenBalFirst=', out.aftDepresardistokenBalFirst.toString());
    console.log(' ')

    console.log('!!!!!!! SECOND USER ACCOUNT INFO=')
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepresardistokenBalSec=', out.befDepresardistokenBalSec.toString());
    console.log('aftDepresardistokenBalSec=', out.aftDepresardistokenBalSec.toString());
    console.log(' ')

    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());

    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check if deposits done correctly
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount)).sub(feeMake)).toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount))).toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), (feeMake.add(out.initTokenBalFeeAcc)).toString());
    assert.notEqual(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.toString())
    assert.equal(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.add(resardistokenFee).toString())
  });
  it('Try to place an order, then do some trading, and succeed (non-zero-fee) (First and second user will pay resardistoken as fee (they are both smart :) .)', async () => {
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
    await dexInstance.changeResardisTokenFee("1", { from: currentAdmin });
    const resardistokenFee = await dexInstance.getResardisTokenFee.call();
    // users change their Options
    const initFirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const initSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });
    await dexInstance.feeOptionSet(firstAccount, true, { from: firstAccount });
    await dexInstance.feeOptionSet(secAccount, true, { from: secAccount });
    const finalDirstAccountFeeOption = await dexInstance.feeOptionAccount(firstAccount, { from: firstAccount });
    const finalSecAccountFeeOption = await dexInstance.feeOptionAccount(secAccount, { from: secAccount });

    // trade
    const out = await tradeFlow('6');
    console.log('!!!!!!! FEE INFO=');
    console.log('feeMake=', feeMake.toString());
    console.log('feeTake=', feeTake.toString());
    console.log('resardistokenFee=', resardistokenFee.toString());
    console.log(' ')

    console.log('!!!!!!! FEE ACCOUNT INFO=')
    console.log('initEthBalFeeAcc=', out.initEthBalFeeAcc.toString());
    console.log('initTokenBalFeeAcc=', out.initTokenBalFeeAcc.toString());
    console.log('finEthBalFeeAcc=', out.finEthBalFeeAcc.toString());
    console.log('finTokenBalFeeAcc=', out.finTokenBalFeeAcc.toString());
    console.log('initresardistokenBalFeeAcc=', out.initresardistokenBalFeeAcc.toString());
    console.log('finresardistokenBalFeeAcc=', out.finresardistokenBalFeeAcc.toString());
    console.log(' ')

    console.log('!!!!!!! FIRST USER ACCOUNT INFO=')
    console.log('initFirstAccountFeeOption=', initFirstAccountFeeOption);
    console.log('finalDirstAccountFeeOption=', finalDirstAccountFeeOption);
    console.log('befDepEthBalFirst=', out.befDepEthBalFirst.toString());
    console.log('aftDepEthBalFirst=', out.aftDepEthBalFirst.toString());
    console.log('initTokenBalFirst=', out.initTokenBalFirst.toString());
    console.log('befDepresardistokenBalFirst=', out.befDepresardistokenBalFirst.toString());
    console.log('aftDepresardistokenBalFirst=', out.aftDepresardistokenBalFirst.toString());
    console.log(' ')

    console.log('!!!!!!! SECOND USER ACCOUNT INFO=')
    console.log('initSecAccountFeeOption=', initSecAccountFeeOption);
    console.log('finalSecAccountFeeOption=', finalSecAccountFeeOption);
    console.log('initEthBalSec=', out.initEthBalSec.toString());
    console.log('befDepTokenBalSec=', out.befDepTokenBalSec.toString());
    console.log('aftDepTokenBalSec=', out.aftDepTokenBalSec.toString());
    console.log('befDepresardistokenBalSec=', out.befDepresardistokenBalSec.toString());
    console.log('aftDepresardistokenBalSec=', out.aftDepresardistokenBalSec.toString());
    console.log(' ')

    console.log('initTokenBalFirst + tradeAmount=', (out.initTokenBalFirst.add(tradeAmount)).toString());
    console.log('aftDepEthBalFirst - amountGive=', (out.aftDepEthBalFirst.sub(amountGive)).toString());
    console.log('aftDepTokenBalSec - tradeAmount=', (out.aftDepTokenBalSec.sub(tradeAmount)).toString());
    console.log('initEthBalSec + amountGive=', (out.initEthBalSec.add(amountGive)).toString());

    console.log('finTokenBalFirst=', out.finTokenBalFirst.toString());
    console.log('finEthBalFirst=', out.finEthBalFirst.toString());
    console.log('finTokenBalSec=', out.finTokenBalSec.toString());
    console.log('finEthBalSec=', out.finEthBalSec.toString());

    // Check if deposits done correctly
    assert.notEqual(out.befDepEthBalFirst.toString(), out.aftDepEthBalFirst.toString());
    assert.equal((out.befDepEthBalFirst.add(depAmountEth)).toString(), out.aftDepEthBalFirst.toString());
    assert.notEqual(out.befDepTokenBalSec.toString(), out.aftDepTokenBalSec.toString());
    assert.equal((out.befDepTokenBalSec.add(depAmountToken)).toString(), out.aftDepTokenBalSec.toString());
    // Compare the available and filled order volumes
    assert.equal(out.availableAfterOrder.toString(), amountGet.toString());
    assert.equal(out.filledAfterOrder.toString(), (web3.utils.toBN('0')).toString());
    assert.equal(out.availableAfterTrade.toString(), (amountGet.sub(tradeAmount)).toString());
    assert.equal(out.filledAfterTrade.toString(), tradeAmount.toString());
    // Check if trading done correctly
    assert.equal(out.finEthBalFirst.toString(), (out.aftDepEthBalFirst.sub(amountGive)).toString());
    assert.equal(out.finEthBalSec.toString(), (out.initEthBalSec.add(amountGive)).toString());
    assert.equal(out.finTokenBalFirst.toString(), ((out.initTokenBalFirst.add(tradeAmount))).toString());
    assert.equal(out.finTokenBalSec.toString(), ((out.aftDepTokenBalSec.sub(tradeAmount))).toString());
    // Check the fee accounts
    assert.equal(out.finEthBalFeeAcc.toString(), out.initEthBalFeeAcc.toString());
    assert.equal(out.finTokenBalFeeAcc.toString(), (out.initTokenBalFeeAcc).toString());
    assert.notEqual(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.toString())
    assert.equal(out.finresardistokenBalFeeAcc.toString(), out.initresardistokenBalFeeAcc.add(resardistokenFee).add(resardistokenFee).toString())
  });
});
