const Resardis = artifacts.require("Resardis");

contract("TestResardis-EthFunding", async accounts => {
  // @TODO Is there a cleaner way for address(0), like in Solidity?
  let addressZero = await "0x0000000000000000000000000000000000000000";
  let depAccount = await accounts[3];
  let drawAccount = await accounts[4];
  let depAmount = await '8.44';
  let normalDraftAmount = await '2.66';  // make this sth smaller than depAmount
  let overDraftAmount = await '10.55';  // make this sth bigger than depAmount

  it("Try to deposit Ether and succeed", async () => {
    let instance = await Resardis.deployed();
    let amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    let initBalance = await instance.balanceOf(addressZero, depAccount, {from: depAccount});
    await instance.deposit({from: depAccount, value: amount});
    let finalBalance = await instance.balanceOf(addressZero, depAccount, {from: depAccount});
    let supposedBalance = initBalance.add(amount);

    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(amount.toString(), finalBalance.toString());
    assert.equal(supposedBalance.toString(), finalBalance.toString());
  });

  it("Try to withdraw Ether (overdraft) and fail", async () => {
    let instance = await Resardis.deployed();
    // deposit some amount first
    let amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    await instance.deposit({from: drawAccount, value: amount});
    // try to withdraw
    let initBalance = await instance.balanceOf(addressZero, drawAccount, {from: drawAccount});
    let drawAmount = await web3.utils.toBN(web3.utils.toWei(overDraftAmount, 'ether')).add(initBalance);
    try {
      await instance.withdraw(drawAmount, {from: drawAccount});
    }
    catch(err) {
      console.log("Could not withdraw ether higher than the balance as expected.");
    }
    let finalBalance = await instance.balanceOf(addressZero, drawAccount, {from: drawAccount});
    assert.equal(initBalance.toString(), finalBalance.toString());
  });

  it("Try to withdraw Ether and succeed", async () => {
    let instance = await Resardis.deployed();
    // deposit some amount first
    let amount = await web3.utils.toBN(web3.utils.toWei(depAmount, 'ether'));
    await instance.deposit({from: drawAccount, value: amount});
    // try to withdraw
    let initBalance = await instance.balanceOf(addressZero, drawAccount, {from: drawAccount});
    let drawAmount = await web3.utils.toBN(web3.utils.toWei(normalDraftAmount, 'ether'));
    let diffAmount = await initBalance.sub(drawAmount)
    await instance.withdraw(drawAmount, {from: drawAccount});
    let finalBalance = await instance.balanceOf(addressZero, drawAccount, {from: drawAccount});

    assert.notEqual(drawAmount.toString(), finalBalance.toString());
    assert.notEqual(initBalance.toString(), finalBalance.toString());
    assert.equal(diffAmount.toString(), finalBalance.toString());
  });

});
