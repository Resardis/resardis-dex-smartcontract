'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20MintableX');
// const resToken = artifacts.require('ERC20MintableY');

contract('TestResardis-Trading', async accounts => {
  let addressZero;
  let initMinter;
  let firstAccount;
  let secAccount;
  let depAmountEth;
  let depAmountToken;
  let amountGet;
  let amountGive;
  let amountGetTokenNonMatch;
  let amountGiveEthNonMatch;
  let amountGetEthNonMatch;
  let amountGiveTokenNonMatch;
  // let tradeAmount;
  let mintAmount;
  // let expiryIncrement;
  let dexInstance;
  let tokenInstance;
  // let resTokenInstance;
  let dexAddress;
  let tokenAddress;
  // let feeAccount;
  // let earlyDate;
  // let resTokenAddress;
  let counterOfferMadeTotal = 0;
  let counterOfferMadeFirst = 0;  // number of offers made from the first account
  let counterOfferMadeSec = 0;  // number of offers made from the second account
  let counterOfferCancelledFirst = 0;
  let counterOfferCancelledSec = 0;

  const valueBigZero = web3.utils.toBN('0');


  beforeEach('Assign Trading variables', async () => {
    addressZero = web3.utils.toChecksumAddress('0x0000000000000000000000000000000000000000');
    initMinter = accounts[0];
    firstAccount = accounts[6];
    secAccount = accounts[7];
    depAmountEth = web3.utils.toBN(web3.utils.toWei('13.5', 'ether'));
    depAmountToken = web3.utils.toBN(web3.utils.toWei('48.5', 'ether'));
    amountGet = web3.utils.toBN(web3.utils.toWei('12.4', 'ether'));
    amountGive = web3.utils.toBN(web3.utils.toWei('7.8', 'ether'));
    // Adjust NonMatch prices so that the orders does not overlap
    amountGetTokenNonMatch = web3.utils.toBN(web3.utils.toWei('5.2', 'ether'));
    amountGiveEthNonMatch = web3.utils.toBN(web3.utils.toWei('10.4', 'ether'));
    amountGetEthNonMatch = web3.utils.toBN(web3.utils.toWei('15.4', 'ether'));
    amountGiveTokenNonMatch = web3.utils.toBN(web3.utils.toWei('5.2', 'ether'));

    // tradeAmount = amountGet;
    mintAmount = web3.utils.toBN(web3.utils.toWei('500', 'ether'));
    // expiryIncrement = web3.utils.toBN('50'); // added to the blockNumber to set the expiry
    dexInstance = await Resardis.deployed();
    tokenInstance = await erc20.deployed();
    // resTokenInstance = await resToken.deployed();
    dexAddress = web3.utils.toChecksumAddress(dexInstance.address);
    tokenAddress = web3.utils.toChecksumAddress(tokenInstance.address);
    // resTokenAddress = web3.utils.toChecksumAddress(resTokenInstance.address);
    // feeAccount = await dexInstance.feeAccount.call();
    // earlyDate = web3.utils.toBN(788918400); // 1995/01/01
  });

  it('Place a single order, then cancel it.', async () => {
    // deposit some ETH
    const initBalance = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    await dexInstance.deposit({ from: firstAccount, value: depAmountEth });
    const finalBalance = await dexInstance.balanceOf(addressZero, firstAccount, { from: firstAccount });
    const supposedBalance = initBalance.add(depAmountEth);

    // allow ETH and Token orders
    const currentAdmin = await dexInstance.admin.call();
    await dexInstance.changeAllowedToken(tokenAddress, true, false, { from: currentAdmin });
    await dexInstance.changeAllowedToken(addressZero, true, false, { from: currentAdmin });

    // Values before offer is made
    const initBalanceInUse = await dexInstance.balanceInUse(addressZero, firstAccount, { from: firstAccount });
    const initLastHistoryIndex = await dexInstance.lastOffersHistoryIndex.call(firstAccount);
    const initLastOfferId = await dexInstance.last_offer_id.call();
    const initIdIndex = await dexInstance.getIdIndexRaw(firstAccount, initLastOfferId);

    // Place the order
    const initCounterOfferMadeTotal = counterOfferMadeTotal;
    const initCounterOfferMadeFirst = counterOfferMadeFirst;

    await dexInstance.offer(
      amountGive, addressZero, amountGet, tokenAddress, 0,
      { from: firstAccount, value: 0 },
    );

    counterOfferMadeTotal++;
    counterOfferMadeFirst++;

    const finalCounterOfferMadeTotal = counterOfferMadeTotal;
    const finalCounterOfferMadeFirst = counterOfferMadeFirst;

    // Values after offer is made
    const finalBalanceInUse = await dexInstance.balanceInUse(addressZero, firstAccount, { from: firstAccount });
    const finalLastHistoryIndex = await dexInstance.lastOffersHistoryIndex.call(firstAccount);
    const finalLastOfferId = await dexInstance.last_offer_id.call();
    const finalIdIndex = await dexInstance.getIdIndexRaw(firstAccount, finalLastOfferId);

    // Get offer values
    const actualOffer = await dexInstance.getOffer(finalLastOfferId);
    const historcalOffer = await dexInstance.getSingleOfferFromHistory(firstAccount, finalLastOfferId);

    // Cancel the order
    await dexInstance.cancel(finalLastOfferId, { from: firstAccount, value: 0 });
    counterOfferCancelledFirst++;

    // Values after offer is cancelled
    const afterCancelBalanceInUse = await dexInstance.balanceInUse(addressZero, firstAccount, { from: firstAccount });
    const afterCancelLastHistoryIndex = await dexInstance.lastOffersHistoryIndex.call(firstAccount);
    const afterCancelLastOfferId = await dexInstance.last_offer_id.call();
    const afterCancelIdIndex = await dexInstance.getIdIndexRaw(firstAccount, afterCancelLastOfferId);
    const afterCancelActualOffer = await dexInstance.getOffer(afterCancelLastOfferId);
    const afterCancelHistorcalOffer = await dexInstance.getSingleOfferFromHistory(firstAccount, afterCancelLastOfferId);

    // Start assertions
    assert.equal(afterCancelBalanceInUse.toString(), valueBigZero.toString());
    assert.equal(afterCancelBalanceInUse.toString(), initBalanceInUse.toString());
    assert.equal(afterCancelLastHistoryIndex.toString(), finalLastHistoryIndex.toString());
    assert.equal(afterCancelLastOfferId.toString(), finalLastOfferId.toString());
    assert.equal(afterCancelIdIndex.toString(), finalIdIndex.toString());

    assert.equal(afterCancelActualOffer[0].toString(), valueBigZero.toString());
    assert.equal(afterCancelActualOffer[1].toString(), addressZero.toString());
    assert.equal(afterCancelActualOffer[2].toString(), valueBigZero.toString());
    assert.equal(afterCancelActualOffer[3].toString(), addressZero.toString());

    assert.equal(afterCancelHistorcalOffer[0].toString(), amountGive.toString());
    assert.equal(afterCancelHistorcalOffer[1].toString(), addressZero.toString());
    assert.equal(afterCancelHistorcalOffer[2].toString(), amountGet.toString());
    assert.equal(afterCancelHistorcalOffer[3].toString(), tokenAddress.toString());
    assert.isTrue(afterCancelHistorcalOffer[4]);
    assert.isFalse(afterCancelHistorcalOffer[5]);
    assert.equal(afterCancelHistorcalOffer[6].toString(), valueBigZero.toString());
    assert.equal(afterCancelHistorcalOffer[7].toString(), valueBigZero.toString());
    assert.equal(afterCancelHistorcalOffer[6].toString(), historcalOffer[6].toString());
    assert.equal(afterCancelHistorcalOffer[7].toString(), historcalOffer[7].toString());

    assert.equal(actualOffer[0].toString(), amountGive.toString());
    assert.equal(actualOffer[1].toString(), addressZero.toString());
    assert.equal(actualOffer[2].toString(), amountGet.toString());
    assert.equal(actualOffer[3].toString(), tokenAddress.toString());

    assert.equal(historcalOffer[0].toString(), amountGive.toString());
    assert.equal(historcalOffer[1].toString(), addressZero.toString());
    assert.equal(historcalOffer[2].toString(), amountGet.toString());
    assert.equal(historcalOffer[3].toString(), tokenAddress.toString());
    assert.isFalse(historcalOffer[4]);
    assert.isFalse(historcalOffer[5]);
    assert.equal(historcalOffer[6].toString(), valueBigZero.toString());
    assert.equal(historcalOffer[7].toString(), valueBigZero.toString());

    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(supposedBalance.toString(), finalBalance.toString());
    assert.equal(initBalanceInUse.toString(), valueBigZero.toString());
    assert.equal(finalBalanceInUse.toString(), amountGive.toString());

    assert.notEqual(initLastHistoryIndex.toString(), finalLastHistoryIndex.toString());
    assert.equal(initLastHistoryIndex.toString(), (web3.utils.toBN(initCounterOfferMadeFirst)).toString());
    assert.equal(finalLastHistoryIndex.toString(), (web3.utils.toBN(finalCounterOfferMadeFirst)).toString());
    assert.equal(finalLastHistoryIndex.toString(), (initLastHistoryIndex.add(web3.utils.toBN('1'))).toString());


    assert.notEqual(initLastOfferId.toString(), finalLastOfferId.toString());
    assert.equal(initLastOfferId.toString(), (web3.utils.toBN(initCounterOfferMadeTotal)).toString());
    assert.equal(finalLastOfferId.toString(), (web3.utils.toBN(finalCounterOfferMadeTotal)).toString());
    assert.equal(finalLastOfferId.toString(), (initLastOfferId.add(web3.utils.toBN('1'))).toString());


    assert.notEqual(initIdIndex.toString(), finalIdIndex.toString());
    assert.equal(initIdIndex.toString(), (web3.utils.toBN(initCounterOfferMadeFirst)).toString());
    assert.equal(finalIdIndex.toString(), (web3.utils.toBN(finalCounterOfferMadeFirst)).toString());
    assert.equal(finalIdIndex.toString(), (initIdIndex.add(web3.utils.toBN('1'))).toString());
  });

  it('Place an order from the First Account. Place an order that DO NOT MATCH from the Second Account.', async () => {
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

    // Values before offers are made
    const initLastOfferIdCommon = await dexInstance.last_offer_id.call();

    const initEthBalanceInUseFirst = await dexInstance.balanceInUse(addressZero, firstAccount, { from: firstAccount });
    const initTokenBalanceInUseFirst = await dexInstance.balanceInUse(tokenAddress, firstAccount, { from: firstAccount });
    const initLastHistoryIndexFirst = await dexInstance.lastOffersHistoryIndex.call(firstAccount);
    const initIdIndexFirst = await dexInstance.getIdIndexRaw(firstAccount, initLastOfferIdCommon);

    const initEthBalanceInUseSec = await dexInstance.balanceInUse(addressZero, secAccount, { from: secAccount });
    const initTokenBalanceInUseSec = await dexInstance.balanceInUse(tokenAddress, secAccount, { from: secAccount });
    const initLastHistoryIndexSec = await dexInstance.lastOffersHistoryIndex.call(secAccount);
    const initIdIndexSec = await dexInstance.getIdIndexRaw(secAccount, initLastOfferIdCommon);

    // Place the offers
    const initCounterOfferMadeTotal = counterOfferMadeTotal;

    const initCounterOfferMadeFirst = counterOfferMadeFirst;
    await dexInstance.offer(
      amountGiveEthNonMatch, addressZero, amountGetTokenNonMatch, tokenAddress, 0,
      { from: firstAccount, value: 0 },
    );

    counterOfferMadeTotal++;
    counterOfferMadeFirst++;
    const finalCounterOfferMadeFirst = counterOfferMadeFirst;
    const afterFirstLastOfferId = await dexInstance.last_offer_id.call();

    const initCounterOfferMadeSec = counterOfferMadeSec;
    await dexInstance.offer(
      amountGiveTokenNonMatch, tokenAddress, amountGetEthNonMatch, addressZero, 0,
      { from: secAccount, value: 0 },
    );
    counterOfferMadeTotal++;
    counterOfferMadeSec++;
    const finalCounterOfferMadeSec = counterOfferMadeSec;
    const afterSecLastOfferId = await dexInstance.last_offer_id.call();

    const finalCounterOfferMadeTotal = counterOfferMadeTotal;

    // Final balance that is locked (i.e. in order/use)
    const finalEthBalanceInUseFirst = await dexInstance.balanceInUse(addressZero, firstAccount, { from: firstAccount });
    const finalTokenBalanceInUseFirst = await dexInstance.balanceInUse(tokenAddress, firstAccount, { from: firstAccount });
    const finalLastHistoryIndexFirst = await dexInstance.lastOffersHistoryIndex.call(firstAccount);
    const finalIdIndexFirst = await dexInstance.getIdIndexRaw(firstAccount, afterFirstLastOfferId);
    const actualOfferFirst = await dexInstance.getOffer(afterFirstLastOfferId);
    const historcalOfferFirst = await dexInstance.getSingleOfferFromHistory(firstAccount, afterFirstLastOfferId);

    const finalEthBalanceInUseSec = await dexInstance.balanceInUse(addressZero, secAccount, { from: secAccount });
    const finalTokenBalanceInUseSec = await dexInstance.balanceInUse(tokenAddress, secAccount, { from: secAccount });
    const finalLastHistoryIndexSec = await dexInstance.lastOffersHistoryIndex.call(secAccount);
    const finalIdIndexSec = await dexInstance.getIdIndexRaw(secAccount, afterSecLastOfferId);
    const actualOfferSec = await dexInstance.getOffer(afterSecLastOfferId);
    const historcalOfferSec = await dexInstance.getSingleOfferFromHistory(secAccount, afterSecLastOfferId);


    assert.notEqual(befDepEthBalFirst.toString(), aftDepEthBalFirst.toString());
    assert.equal(aftDepEthBalFirst.toString(), (befDepEthBalFirst.add(depAmountEth)).toString());
    assert.equal(initTokenBalFirst.toString(), valueBigZero.toString());
    assert.notEqual(befDepTokenBalSec.toString(), aftDepTokenBalSec.toString());
    assert.equal(aftDepTokenBalSec.toString(), (befDepTokenBalSec.add(depAmountToken)).toString());
    assert.equal(initEthBalSec.toString(), valueBigZero.toString());


    assert.notEqual(initEthBalanceInUseFirst.toString(), finalEthBalanceInUseFirst.toString());
    assert.equal(initTokenBalanceInUseFirst.toString(), valueBigZero.toString());
    assert.equal(initEthBalanceInUseFirst.add(amountGiveEthNonMatch).toString(), finalEthBalanceInUseFirst.toString());
    assert.notEqual(initTokenBalanceInUseSec.toString(), finalEthBalanceInUseFirst.toString());
    assert.equal(initEthBalanceInUseSec.toString(), valueBigZero.toString());
    assert.equal(initTokenBalanceInUseSec.add(amountGiveTokenNonMatch).toString(), finalTokenBalanceInUseSec.toString());

    assert.equal(initLastOfferIdCommon.toString(), (web3.utils.toBN('1')).toString());

    assert.notEqual(initLastHistoryIndexFirst.toString(), finalLastHistoryIndexFirst.toString());
    assert.notEqual(initLastOfferIdCommon.toString(), afterFirstLastOfferId.toString());
    assert.equal(initIdIndexFirst.add(web3.utils.toBN('1')).toString(), finalIdIndexFirst.toString());
    assert.equal(initIdIndexFirst.toString(), (web3.utils.toBN(initCounterOfferMadeFirst)).toString());
    assert.equal(finalIdIndexFirst.toString(), web3.utils.toBN(finalCounterOfferMadeFirst).toString());
    assert.equal(initLastHistoryIndexFirst.toString(), (web3.utils.toBN(initCounterOfferMadeFirst)).toString());
    assert.equal(finalLastHistoryIndexFirst.toString(), (web3.utils.toBN(finalCounterOfferMadeFirst)).toString());
    assert.equal(afterFirstLastOfferId.toString(), (web3.utils.toBN(initLastOfferIdCommon)).add(web3.utils.toBN('1')).toString());
    assert.equal(initLastOfferIdCommon.add(web3.utils.toBN('1')).toString(), afterFirstLastOfferId.toString());

    assert.notEqual(initLastHistoryIndexSec.toString(), finalLastHistoryIndexSec.toString());
    assert.notEqual(initLastOfferIdCommon.toString(), afterSecLastOfferId.toString());
    assert.equal(initIdIndexSec.add(web3.utils.toBN('1')).toString(), finalIdIndexSec.toString());
    assert.equal(initIdIndexSec.toString(), (web3.utils.toBN(initCounterOfferMadeSec)).toString());
    assert.equal(finalIdIndexSec.toString(), (web3.utils.toBN(finalCounterOfferMadeSec)).toString());
    assert.equal(initLastHistoryIndexSec.toString(), (web3.utils.toBN(initCounterOfferMadeSec)).toString());
    assert.equal(afterSecLastOfferId.toString(), initLastOfferIdCommon.add(web3.utils.toBN('2')).toString());
    assert.equal(initLastOfferIdCommon.add(web3.utils.toBN('2')).toString(), afterSecLastOfferId.toString());
    assert.equal(finalLastHistoryIndexSec.toString(), (web3.utils.toBN(finalCounterOfferMadeSec)).toString());
  });

});
