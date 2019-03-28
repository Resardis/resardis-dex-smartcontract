'use strict';

const Resardis = artifacts.require('Resardis');

contract('TestResardis-ChangeFunctions', async accounts => {
  let putativeFeeMake;
  let putativeFeeTake;
  let putativeFeeRebate;
  let putativeNoFeeUntilEarly;
  let putativeNoFeeUntilLate;
  let putativeFeeAccount;
  let putativeAccLevAddr;
  let putativeAdmin;
  let noAdminAccount;
  let instance;

  beforeEach('Assign ChangeFunctions variables', async () => {
    putativeFeeMake = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    putativeFeeTake = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    putativeFeeRebate = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    putativeNoFeeUntilEarly = web3.utils.toBN(788918400); // 1995/01/01
    putativeNoFeeUntilLate = web3.utils.toBN(4102444800); // 2100/01/01
    putativeFeeAccount = accounts[2];
    putativeAccLevAddr = accounts[3];
    putativeAdmin = accounts[4];
    noAdminAccount = accounts[5];
    instance = await Resardis.deployed();
  });

  it('Try to change the maker, taker and rebate fees and fail', async () => {
    const oldFeeMake = await instance.feeMake.call();
    const oldFeeTake = await instance.feeTake.call();
    const oldFeeRebate = await instance.feeRebate.call();
    try {
      await instance.changeFeeMake(putativeFeeMake, { from: noAdminAccount });
      await instance.changeFeeTake(putativeFeeTake, { from: noAdminAccount });
      await instance.changeFeeRebate(putativeFeeRebate, { from: noAdminAccount });
    } catch (err) {
      console.log('Maker, taker and rebate fees could not have been changed with the given msg.sender as expected.');
    }
    const newFeeMake = await instance.feeMake.call();
    const newFeeTake = await instance.feeTake.call();
    const newFeeRebate = await instance.feeRebate.call();
    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.equal(oldFeeMake.toString(), newFeeMake.toString());
    assert.equal(oldFeeTake.toString(), newFeeTake.toString());
    assert.equal(oldFeeRebate.toString(), newFeeRebate.toString());
  });

  it('Try to change the maker, taker and rebate fees and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldFeeMake = await instance.feeMake.call();
    const oldFeeTake = await instance.feeTake.call();
    const oldFeeRebate = await instance.feeRebate.call();
    try {
      await instance.changeFeeMake(putativeFeeMake, { from: currentAdmin });
      await instance.changeFeeTake(putativeFeeTake, { from: currentAdmin });
      await instance.changeFeeRebate(putativeFeeRebate, { from: currentAdmin });
    } catch (err) {
      console.log('Error while changing the maker, taker and rebate fees.');
    }
    const newFeeMake = await instance.feeMake.call();
    const newFeeTake = await instance.feeTake.call();
    const newFeeRebate = await instance.feeRebate.call();
    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.notEqual(oldFeeMake.toString(), newFeeMake.toString());
    assert.notEqual(oldFeeTake.toString(), newFeeTake.toString());
    assert.notEqual(oldFeeRebate.toString(), newFeeRebate.toString());
    assert.equal(putativeFeeMake.toString(), newFeeMake.toString());
    assert.equal(putativeFeeTake.toString(), newFeeTake.toString());
    assert.equal(putativeFeeRebate.toString(), newFeeRebate.toString());
  });

  it('Try to change the no-fee period and fail', async () => {
    const currentAdmin = await instance.admin.call();
    const oldNoFeeUntil = await instance.noFeeUntil.call();
    try {
      // the input date is not allowed, but sending from admin
      await instance.changeNoFeeUntil(putativeNoFeeUntilEarly, { from: currentAdmin });
    } catch (err) {
      console.log('The given no-fee-until date is not allowed as expected.');
    }
    const newNoFeeUntilFirst = await instance.noFeeUntil.call();
    try {
      // the input date is allowed but not sending from admin
      await instance.changeNoFeeUntil(putativeNoFeeUntilLate, { from: noAdminAccount });
    } catch (err) {
      console.log('The given msg.sender is not allowed to change no-fee-until date as expected. ');
    }
    const newNoFeeUntilSec = await instance.noFeeUntil.call();
    assert.equal(oldNoFeeUntil.toString(), newNoFeeUntilFirst.toString());
    assert.equal(oldNoFeeUntil.toString(), newNoFeeUntilSec.toString());
  });

  it('Try to change the no-fee period and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldNoFeeUntil = await instance.noFeeUntil.call();
    try {
      // date is allowed, and sending from admin
      await instance.changeNoFeeUntil(putativeNoFeeUntilLate, { from: currentAdmin });
    } catch (err) {
      console.log('Eror while changing no-fee-until date.');
    }
    const newNoFeeUntil = await instance.noFeeUntil.call();
    assert.notEqual(oldNoFeeUntil.toString(), newNoFeeUntil.toString());
    assert.equal(putativeNoFeeUntilLate.toString(), newNoFeeUntil.toString());
  });

  it('Try to change the fee account and fail', async () => {
    const oldFeeAccount = await instance.feeAccount.call();
    try {
      await instance.changeFeeAccount(putativeFeeAccount, { from: noAdminAccount });
    } catch (err) {
      console.log('The fee account could not have been changed with the given msg.sender as expected.');
    }
    const newFeeAccount = await instance.feeAccount.call();
    assert.equal(oldFeeAccount, newFeeAccount);
  });

  it('Try to change the fee account and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldFeeAccount = await instance.feeAccount.call();
    try {
      await instance.changeFeeAccount(putativeFeeAccount, { from: currentAdmin });
    } catch (err) {
      console.log('Error while changing the fee account.');
    }
    const newFeeAccount = await instance.feeAccount.call();
    assert.notEqual(oldFeeAccount, newFeeAccount);
    assert.equal(putativeFeeAccount, newFeeAccount);
  });

  it('Try to change the account levels address and fail', async () => {
    const oldAccLevAddr = await instance.accountLevelsAddr.call();
    try {
      await instance.changeAccountLevelsAddr(putativeAccLevAddr, { from: noAdminAccount });
    } catch (err) {
      console.log('Account levels address could not have been changed with the given msg.sender as expected.');
    }
    const newAccLevAddr = await instance.accountLevelsAddr.call();
    assert.equal(oldAccLevAddr, newAccLevAddr);
  });

  it('Try to change the account levels address and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldAccLevAddr = await instance.accountLevelsAddr.call();
    try {
      await instance.changeAccountLevelsAddr(putativeAccLevAddr, { from: currentAdmin });
    } catch (err) {
      console.log('Error while changing the account levels address.');
    }
    const newAccLevAddr = await instance.accountLevelsAddr.call();
    assert.notEqual(oldAccLevAddr, newAccLevAddr);
    assert.equal(putativeAccLevAddr, newAccLevAddr);
  });

  it('Try to change the admin account and fail', async () => {
    const oldAdmin = await instance.admin.call();
    try {
      await instance.changeAdmin(putativeAdmin, { from: putativeAdmin });
    } catch (err) {
      console.log('The admin account could not have been changed with the given msg.sender as expected.');
    }
    const newAdmin = await instance.admin.call();
    assert.equal(oldAdmin, newAdmin);
  });

  it('Try to change the admin account and succeed', async () => {
    const oldAdmin = await instance.admin.call();
    try {
      await instance.changeAdmin(putativeAdmin, { from: oldAdmin });
    } catch (err) {
      console.log('Error while changing the admin account.');
    }
    const newAdmin = await instance.admin.call();
    assert.equal(putativeAdmin, newAdmin);
  });
});
