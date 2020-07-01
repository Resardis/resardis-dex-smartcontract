'use strict';

const Resardis = artifacts.require('Resardis');
const resToken = artifacts.require('ERC20MintableY');

contract('TestResardis-ChangeFunctions', async accounts => {
  let putativeFeeMake;
  let putativeFeeTake;
  let putativeFeeResToken;
  let putativeNoFeeUntilLate;
  let putativeFeeAccount;
  let putativeAdmin;
  let noAdminAccount;
  let instance;
  let resTokenInstance;
  let resTokenAddress;

  beforeEach('Assign ChangeFunctions variables', async () => {
    putativeFeeMake = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    putativeFeeTake = web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    putativeFeeResToken = web3.utils.toBN(web3.utils.toWei('0.079', 'ether'));
    putativeNoFeeUntilLate = web3.utils.toBN(4102444800); // 2100/01/01
    putativeFeeAccount = accounts[2];
    putativeAdmin = accounts[4];
    noAdminAccount = accounts[5];
    instance = await Resardis.deployed();
    resTokenInstance = await resToken.deployed();
    resTokenAddress = web3.utils.toChecksumAddress(resTokenInstance.address);
  });

  it('Try to change the maker, taker and resardis token fees and fail', async () => {
    const oldFeeMake = await instance.feeMake.call();
    const oldFeeTake = await instance.feeTake.call();
    const oldFeeResToken = await instance.resardisTokenFee.call();
    try {
      await instance.changeFeeMake(putativeFeeMake, { from: noAdminAccount });
      await instance.changeFeeTake(putativeFeeTake, { from: noAdminAccount });
      await instance.changeResardisTokenFee(putativeFeeResToken, { from: noAdminAccount });
    } catch (err) {
      console.log('Maker, taker and res. token fees could not have been changed with this msg.sender as expected.');
    }
    const newFeeMake = await instance.feeMake.call();
    const newFeeTake = await instance.feeTake.call();
    const newFeeResToken = await instance.resardisTokenFee.call();
    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.notEqual(putativeFeeMake.toString(), newFeeMake.toString());
    assert.notEqual(putativeFeeTake.toString(), newFeeTake.toString());
    assert.notEqual(putativeFeeResToken.toString(), newFeeResToken.toString());
    assert.equal(oldFeeMake.toString(), newFeeMake.toString());
    assert.equal(oldFeeTake.toString(), newFeeTake.toString());
    assert.equal(oldFeeResToken.toString(), newFeeResToken.toString());
  });

  it('Try to change the maker, taker and resardis token fees and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldFeeMake = await instance.feeMake.call();
    const oldFeeTake = await instance.feeTake.call();
    const oldFeeResToken = await instance.resardisTokenFee.call();
    try {
      await instance.changeFeeMake(putativeFeeMake, { from: currentAdmin });
      await instance.changeFeeTake(putativeFeeTake, { from: currentAdmin });
      await instance.changeResardisTokenFee(putativeFeeResToken, { from: currentAdmin });
    } catch (err) {
      console.log('Error while changing the maker, taker and resardis token fees.');
    }
    const newFeeMake = await instance.feeMake.call();
    const newFeeTake = await instance.feeTake.call();
    const newFeeResToken = await instance.resardisTokenFee.call();

    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.notEqual(oldFeeMake.toString(), newFeeMake.toString());
    assert.notEqual(oldFeeTake.toString(), newFeeTake.toString());
    assert.notEqual(oldFeeResToken.toString(), newFeeResToken.toString());
    assert.equal(putativeFeeMake.toString(), newFeeMake.toString());
    assert.equal(putativeFeeTake.toString(), newFeeTake.toString());
    assert.equal(putativeFeeResToken.toString(), newFeeResToken.toString());
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

  it('Try to change the Resardis token address and fail', async () => {
    const oldAdress = await instance.resardisToken.call();
    try {
      await instance.setResardisTokenAddress(resTokenAddress, { from: noAdminAccount });
    } catch (err) {
      console.log('The Resardis token address could not have been changed with the given msg.sender as expected.');
    }
    const newAdress = await instance.resardisToken.call();
    assert.notEqual(resTokenAddress, newAdress);
    assert.equal(oldAdress, newAdress);
  });

  it('Try to change the Resardis token address and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldAdress = await instance.resardisToken.call();
    try {
      await instance.setResardisTokenAddress(resTokenAddress, { from: currentAdmin });
    } catch (err) {
      console.log('Error while changing the Resardis token address.');
    }
    const newAdress = await instance.resardisToken.call();
    assert.notEqual(oldAdress, newAdress);
    assert.notEqual(oldAdress, resTokenAddress);
    assert.equal(resTokenAddress, newAdress);
  });

  it('Try to change the fee option and fail', async () => {
    const currentAdmin = await instance.admin.call();
    const oldFeeOption = await instance.getFeeOption(noAdminAccount, { from: noAdminAccount });
    try {
      await instance.changeFeeOption(noAdminAccount, true, { from: currentAdmin });
    } catch (err) {
      console.log('The fee option could not have been changed with the given msg.sender as expected.');
    }
    const newFeeOption = await instance.getFeeOption(noAdminAccount, { from: noAdminAccount });
    assert.isFalse(oldFeeOption);
    assert.isFalse(newFeeOption);
    assert.equal(oldFeeOption, newFeeOption);
  });

  it('Try to change the fee option and succeed', async () => {
    const oldFeeOption = await instance.getFeeOption(noAdminAccount, { from: noAdminAccount });
    try {
      await instance.changeFeeOption(noAdminAccount, true, { from: noAdminAccount });
    } catch (err) {
      console.log('Error while changing the fee option.');
    }
    const newFeeOption = await instance.getFeeOption(noAdminAccount, { from: noAdminAccount });
    assert.isFalse(oldFeeOption);
    assert.isTrue(newFeeOption);
    assert.notEqual(oldFeeOption, newFeeOption);
  });

  it('Try to change the allowed deposit token and fail', async () => {
    const oldTokenPermission = await instance.getAllowedDepositToken(resTokenAddress, { from: noAdminAccount });
    try {
      await instance.changeAllowedToken(resTokenAddress, true, false, { from: noAdminAccount });
    } catch (err) {
      console.log('The allowed deposit token could not have been changed with the given msg.sender as expected.');
    }
    const newTokenPermission = await instance.getAllowedDepositToken(resTokenAddress, { from: noAdminAccount });
    assert.isFalse(oldTokenPermission);
    assert.isFalse(newTokenPermission);
    assert.equal(oldTokenPermission, newTokenPermission);
  });

  it('Try to change the allowed deposit token and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldTokenPermission = await instance.getAllowedDepositToken(resTokenAddress, { from: currentAdmin });
    await instance.changeAllowedToken(resTokenAddress, true, false, { from: currentAdmin });
    const newTokenPermission = await instance.getAllowedDepositToken(resTokenAddress, { from: currentAdmin });
    assert.isFalse(oldTokenPermission);
    assert.isTrue(newTokenPermission);
    assert.notEqual(oldTokenPermission, newTokenPermission);
  });

  it('Try to change the allowed withdraw token and fail', async () => {
    const oldTokenPermission = await instance.getAllowedWithdrawToken(resTokenAddress, { from: noAdminAccount });
    try {
      await instance.changeAllowedToken(resTokenAddress, true, true, { from: noAdminAccount });
    } catch (err) {
      console.log('The allowed withdraw token could not have been changed with the given msg.sender as expected.');
    }
    const newTokenPermission = await instance.getAllowedWithdrawToken(resTokenAddress, { from: noAdminAccount });
    assert.isFalse(oldTokenPermission);
    assert.isFalse(newTokenPermission);
    assert.equal(oldTokenPermission, newTokenPermission);
  });

  it('Try to change the allowed withdraw token and succeed', async () => {
    const currentAdmin = await instance.admin.call();
    const oldTokenPermission = await instance.getAllowedWithdrawToken(resTokenAddress, { from: currentAdmin });
    await instance.changeAllowedToken(resTokenAddress, true, true, { from: currentAdmin });
    const newTokenPermission = await instance.getAllowedWithdrawToken(resTokenAddress, { from: currentAdmin });
    assert.isFalse(oldTokenPermission);
    assert.isTrue(newTokenPermission);
    assert.notEqual(oldTokenPermission, newTokenPermission);
  });
});
