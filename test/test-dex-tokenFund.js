'use strict';

const Resardis = artifacts.require('Resardis');
const erc20 = artifacts.require('ERC20Mintable');

contract('TestResardis-TokenFunding', async accounts => {
  const initMinter = await accounts[0];
  const depAccount = await accounts[3];
  const drawAccount = await accounts[4];
  const depAmount = await '8.44';
  const normalDraftAmount = await '2.66'; // make this sth smaller than depAmount
  const overDraftAmount = await '10.55'; // make this sth bigger than depAmount
  const mintAmount = await '500';

  it('Try to add a minter account and succeed', async () => {
    const tokenInstance = await erc20.deployed();
    await tokenInstance.addMinter(depAccount, { from: initMinter });
    await tokenInstance.addMinter(drawAccount, { from: initMinter });
    const firstMinter = await tokenInstance.isMinter(depAccount, { from: initMinter });
    const secMinter = await tokenInstance.isMinter(drawAccount, { from: initMinter });

    assert.isTrue(firstMinter);
    assert.isTrue(secMinter);
  });

  it('Try to mint tokens and succeed', async () => {
    const tokenInstance = await erc20.deployed();
    const amount = await web3.utils.toBN(web3.utils.toWei(mintAmount, 'ether'));
    await tokenInstance.mint(depAccount, amount, { from: initMinter, value: 0 });
    await tokenInstance.mint(drawAccount, amount, { from: initMinter, value: 0 });
    const finalBalanceFirst = await tokenInstance.balanceOf(depAccount, { from: initMinter });
    const finalBalanceSec = await tokenInstance.balanceOf(drawAccount, { from: initMinter });

    assert.equal(amount.toString(), finalBalanceFirst.toString());
    assert.equal(amount.toString(), finalBalanceSec.toString());
  });

  it('Try to deposit Token and succeed', async () => {
    const dexInstance = await Resardis.deployed();
    const tokenInstance = await erc20.deployed();
    // should already be checksummed but just in case
    const dexAddress = await web3.utils.toChecksumAddress(dexInstance.address);
    const tokenAddress = await web3.utils.toChecksumAddress(tokenInstance.address);
    const amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    const initBalance = await dexInstance.balanceOf(tokenAddress, depAccount, { from: depAccount });
    await tokenInstance.approve(dexAddress, amount, { from: depAccount, value: 0 });
    await dexInstance.depositToken(tokenAddress, amount, { from: depAccount, value: 0 });
    const finalBalance = await dexInstance.balanceOf(tokenAddress, depAccount, { from: depAccount });
    const supposedBalance = initBalance.add(amount);

    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(amount.toString(), finalBalance.toString());
    assert.equal(supposedBalance.toString(), finalBalance.toString());
  });

  it('Try to withdraw Token (overdraft) and fail', async () => {
    const dexInstance = await Resardis.deployed();
    const tokenInstance = await erc20.deployed();
    const dexAddress = await web3.utils.toChecksumAddress(dexInstance.address);
    const tokenAddress = await web3.utils.toChecksumAddress(tokenInstance.address);
    const amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    // deposit some amount first
    await tokenInstance.approve(dexAddress, amount, { from: drawAccount, value: 0 });
    await dexInstance.depositToken(tokenAddress, amount, { from: drawAccount, value: 0 });
    // try to withdraw
    const initBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });
    const drawAmount = await web3.utils.toBN(web3.utils.toWei(overDraftAmount, 'ether')).add(initBalance);
    try {
      await dexInstance.withdrawToken(tokenAddress, drawAmount, { from: drawAccount, value: 0 });
    } catch (err) {
      console.log('Could not withdraw token amount higher than the balance as expected.');
    }
    const finalBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });

    assert.equal(initBalance.toString(), finalBalance.toString());
  });

  it('Try to withdraw Token and succeed', async () => {
    const dexInstance = await Resardis.deployed();
    const tokenInstance = await erc20.deployed();
    const dexAddress = await web3.utils.toChecksumAddress(dexInstance.address);
    const tokenAddress = await web3.utils.toChecksumAddress(tokenInstance.address);
    const amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    // deposit some amount first
    await tokenInstance.approve(dexAddress, amount, { from: drawAccount, value: 0 });
    await dexInstance.depositToken(tokenAddress, amount, { from: drawAccount, value: 0 });
    // try to withdraw
    const initBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });
    const drawAmount = await web3.utils.toBN(web3.utils.toWei(normalDraftAmount, 'ether'));
    const diffAmount = await initBalance.sub(drawAmount);
    await dexInstance.withdrawToken(tokenAddress, drawAmount, { from: drawAccount, value: 0 });
    const finalBalance = await dexInstance.balanceOf(tokenAddress, drawAccount, { from: drawAccount });

    assert.notEqual(diffAmount.toString(), initBalance.toString());
    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(diffAmount.toString(), finalBalance.toString());
  });
});
