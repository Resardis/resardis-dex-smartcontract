'use strict';

const Resardis = artifacts.require('Resardis');

contract('TestResardis-ChangeFunctions', async accounts => {
  let putativeFeeMake;
  let putativeFeeTake;
  let putativeNoFeeUntilLate;
  let putativeFeeAccount;
  let putativeAdmin;
  let noAdminAccount;
  let instance;

  beforeEach('Assign ChangeFunctions variables', async () => {
    putativeFeeMake = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    putativeFeeTake = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    putativeNoFeeUntilLate = web3.utils.toBN(4102444800); // 2100/01/01
    putativeFeeAccount = accounts[2];
    putativeAdmin = accounts[4];
    noAdminAccount = accounts[5];
    instance = await Resardis.deployed();
  });

  it('Try to change the maker, taker and rebate fees and fail', async () => {
    const oldFeeMake = await instance.feeMake.call();
    const oldFeeTake = await instance.feeTake.call();
    try {
      await instance.changeFeeMake(putativeFeeMake, { from: noAdminAccount });
      await instance.changeFeeTake(putativeFeeTake, { from: noAdminAccount });
    } catch (err) {
      console.log('Maker, taker and rebate fees could not have been changed with the given msg.sender as expected.');
    }
    const newFeeMake = await instance.feeMake.call();
    const newFeeTake = await instance.feeTake.call();
    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.notEqual(putativeFeeMake.toString(), newFeeMake.toString());
    assert.notEqual(putativeFeeTake.toString(), newFeeTake.toString());
    assert.equal(oldFeeMake.toString(), newFeeMake.toString());
    assert.equal(oldFeeTake.toString(), newFeeTake.toString());
  });

  it('Try to change the maker, taker and rebate fees and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldFeeMake = await instance.feeMake.call();
    const oldFeeTake = await instance.feeTake.call();
    try {
      await instance.changeFeeMake(putativeFeeMake, { from: currentAdmin });
      await instance.changeFeeTake(putativeFeeTake, { from: currentAdmin });
    } catch (err) {
      console.log('Error while changing the maker, taker and rebate fees.');
    }
    const newFeeMake = await instance.feeMake.call();
    const newFeeTake = await instance.feeTake.call();
    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.notEqual(oldFeeMake.toString(), newFeeMake.toString());
    assert.notEqual(oldFeeTake.toString(), newFeeTake.toString());
    assert.equal(putativeFeeMake.toString(), newFeeMake.toString());
    assert.equal(putativeFeeTake.toString(), newFeeTake.toString());
  });

  it('Try to change the no-fee period and fail', async () => {
    const oldNoFeeUntil = await instance.noFeeUntil.call();
    try {
      // the input date is allowed but not sending from admin
      await instance.changeNoFeeUntil(putativeNoFeeUntilLate, { from: noAdminAccount });
    } catch (err) {
      console.log('The given msg.sender is not allowed to change no-fee-until date as expected. ');
    }
    const newNoFeeUntil = await instance.noFeeUntil.call();
    assert.notEqual(putativeNoFeeUntilLate.toString(), newNoFeeUntil.toString());
    assert.equal(oldNoFeeUntil.toString(), newNoFeeUntil.toString());
  });

  it('Try to change the no-fee period and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldNoFeeUntil = await instance.noFeeUntil.call();
    try {
      // date is allowed, and sending from admin
      await instance.changeNoFeeUntil(putativeNoFeeUntilLate, { from: currentAdmin });
    } catch (err) {
      console.log('Error while changing no-fee-until date.');
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
    assert.notEqual(putativeFeeAccount, newFeeAccount);
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

  it('Try to change the admin account and fail', async () => {
    const oldAdmin = await instance.admin.call();
    try {
      await instance.changeAdmin(putativeAdmin, { from: putativeAdmin });
    } catch (err) {
      console.log('The admin account could not have been changed with the given msg.sender as expected.');
    }
    const newAdmin = await instance.admin.call();
    assert.notEqual(putativeAdmin, newAdmin);
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
