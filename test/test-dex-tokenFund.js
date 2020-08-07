'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20MintableX');

contract('TestResardis-TokenFunding', async accounts => {
  let initMinter;
  let depAccount;
  let drawAccount;
  let depAmount;
  let normalDraftAmount; // make this sth smaller than depAmount
  let overDraftAmount; // make this sth bigger than depAmount
  let mintAmount;
  let tokenInstance;
  let dexInstance;
  let dexAddress;
  let tokenAddress;

  beforeEach('Assign TokenFunding variables', async () => {
    initMinter = accounts[0];
    depAccount = accounts[3];
    drawAccount = accounts[4];
    depAmount = web3.utils.toBN(web3.utils.toWei('8.44', 'ether'));
    normalDraftAmount = web3.utils.toBN(web3.utils.toWei('2.66', 'ether')); // make this sth smaller than depAmount
    overDraftAmount = web3.utils.toBN(web3.utils.toWei('10.55', 'ether')); // make this sth bigger than depAmount
    mintAmount = web3.utils.toBN(web3.utils.toWei('500', 'ether'));
    dexInstance = await Resardis.deployed();
    tokenInstance = await erc20.deployed();
    dexAddress = web3.utils.toChecksumAddress(dexInstance.address);
    tokenAddress = web3.utils.toChecksumAddress(tokenInstance.address);
  });

  it('Try to add a minter account and succeed', async () => {
    await tokenInstance.addMinter(depAccount, { from: initMinter });
    await tokenInstance.addMinter(drawAccount, { from: initMinter });
    const firstMinter = await tokenInstance.isMinter(depAccount, { from: initMinter });
    const secMinter = await tokenInstance.isMinter(drawAccount, { from: initMinter });

    assert.isTrue(firstMinter);
    assert.isTrue(secMinter);
  });

  it('Try to mint tokens and succeed', async () => {
    await tokenInstance.mint(depAccount, mintAmount, { from: initMinter, value: 0 });
    await tokenInstance.mint(drawAccount, mintAmount, { from: initMinter, value: 0 });
    const finalBalanceFirst = await tokenInstance.balanceOf(depAccount, { from: initMinter });
    const finalBalanceSec = await tokenInstance.balanceOf(drawAccount, { from: initMinter });

    assert.equal(mintAmount.toString(), finalBalanceFirst.toString());
    assert.equal(mintAmount.toString(), finalBalanceSec.toString());
  });

  it('Try to deposit Token and succeed', async () => {
    // deposit
    const initBalance = await dexInstance.balanceOf(tokenAddress, depAccount, { from: depAccount });
    await tokenInstance.approve(dexAddress, depAmount, { from: depAccount, value: 0 });
    await dexInstance.depositToken(tokenAddress, depAmount, { from: depAccount, value: 0 });
    const finalBalance = await dexInstance.balanceOf(tokenAddress, depAccount, { from: depAccount });
    const supposedBalance = initBalance.add(depAmount);

    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(supposedBalance.toString(), finalBalance.toString());
  });

  it('Try to withdraw Token and fail. Overdraft.', async () => {
    // deposit some amount first
    await tokenInstance.approve(dexAddress, depAmount, { from: drawAccount, value: 0 });
    await dexInstance.depositToken(tokenAddress, depAmount, { from: drawAccount, value: 0 });
    // try to withdraw
    const initBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });
    const drawAmount = overDraftAmount.add(initBalance);
    try {
      await dexInstance.withdrawToken(tokenAddress, drawAmount, { from: drawAccount, value: 0 });
    } catch (err) {
      console.log('Could not withdraw token amount higher than the balance as expected.');
    }
    const finalBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });

    assert.equal(initBalance.toString(), finalBalance.toString());
  });

  it('Try to withdraw Token and succeed', async () => {
    // deposit some amount first
    await tokenInstance.approve(dexAddress, depAmount, { from: drawAccount, value: 0 });
    await dexInstance.depositToken(tokenAddress, depAmount, { from: drawAccount, value: 0 });
    // try to withdraw
    const initBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });
    const diffAmount = initBalance.sub(normalDraftAmount);
    await dexInstance.withdrawToken(tokenAddress, normalDraftAmount, { from: drawAccount, value: 0 });
    const finalBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });

    assert.notEqual(diffAmount.toString(), initBalance.toString());
    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(diffAmount.toString(), finalBalance.toString());
  });
});
