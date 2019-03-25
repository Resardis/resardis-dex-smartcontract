'use strict';

const Resardis = artifacts.require('Resardis');

contract('TestResardis-EthFunding', async accounts => {
  // @TODO Is there a cleaner way for address(0), like in Solidity?
  const addressZero = await '0x0000000000000000000000000000000000000000';
  const depAccount = await accounts[3];
  const drawAccount = await accounts[4];
  const depAmount = await '8.44';
  const normalDraftAmount = await '2.66'; // make this sth smaller than depAmount
  const overDraftAmount = await '10.55'; // make this sth bigger than depAmount

  it('Try to deposit Ether and succeed', async () => {
    const instance = await Resardis.deployed();
    const amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    const initBalance = await instance.balanceOf(addressZero, depAccount, { from: depAccount });
    await instance.deposit({ from: depAccount, value: amount });
    const finalBalance = await instance.balanceOf(addressZero, depAccount, { from: depAccount });
    const supposedBalance = initBalance.add(amount);

    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(amount.toString(), finalBalance.toString());
    assert.equal(supposedBalance.toString(), finalBalance.toString());
  });

  it('Try to withdraw Ether (overdraft) and fail', async () => {
    const instance = await Resardis.deployed();
    // deposit some amount first
    const amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    await instance.deposit({ from: drawAccount, value: amount });
    // try to withdraw
    const initBalance = await instance.balanceOf(addressZero, drawAccount, { from: drawAccount });
    const drawAmount = await web3.utils.toBN(web3.utils.toWei(overDraftAmount, 'ether')).add(initBalance);
    try {
      await instance.withdraw(drawAmount, { from: drawAccount });
    } catch (err) {
      console.log('Could not withdraw ether higher than the balance as expected.');
    }
    const finalBalance = await instance.balanceOf(addressZero, drawAccount, { from: drawAccount });
    assert.equal(initBalance.toString(), finalBalance.toString());
  });

  it('Try to withdraw Ether and succeed', async () => {
    const instance = await Resardis.deployed();
    // deposit some amount first
    const amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    await instance.deposit({ from: drawAccount, value: amount });
    // try to withdraw
    const initBalance = await instance.balanceOf(addressZero, drawAccount, { from: drawAccount });
    const drawAmount = await web3.utils.toBN(web3.utils.toWei(normalDraftAmount, 'ether'));
    const diffAmount = await initBalance.sub(drawAmount);
    await instance.withdraw(drawAmount, { from: drawAccount });
    const finalBalance = await instance.balanceOf(addressZero, drawAccount, { from: drawAccount });

    assert.notEqual(diffAmount.toString(), initBalance.toString());
    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(diffAmount.toString(), finalBalance.toString());
  });
});
