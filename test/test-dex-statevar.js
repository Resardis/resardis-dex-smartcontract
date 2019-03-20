const Resardis = artifacts.require("Resardis");

contract("TestResardis", async accounts => {

  it("Try to change the maker, taker and rebate fees and fail", async () => {
    let instance = await Resardis.deployed();
    let oldFeeMake = await instance.feeMake.call();
    let oldFeeTake = await instance.feeTake.call();
    let oldFeeRebate = await instance.feeRebate.call();
    let putativeFeeMake = await web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    let putativeFeeTake = await web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    let putativeFeeRebate = await web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    try {
      console.log("Trying...");
      await instance.changeFeeMake(putativeFeeMake, {from: accounts[7]});
      await instance.changeFeeTake(putativeFeeTake, {from: accounts[7]});
      await instance.changeFeeRebate(putativeFeeRebate, {from: accounts[7]});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newFeeMake = await instance.feeMake.call();
    let newFeeTake = await instance.feeTake.call();
    let newFeeRebate = await instance.feeRebate.call();
    console.log(oldFeeMake.toString(), newFeeMake.toString());
    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.equal(oldFeeMake.toString(), newFeeMake.toString());
    assert.equal(oldFeeTake.toString(), newFeeTake.toString());
    assert.equal(oldFeeRebate.toString(), newFeeRebate.toString());
  });

  it("Try to change the maker, taker and rebate fees and succeed", async () => {
    let instance = await Resardis.deployed();
    let currentAdmin = await instance.admin.call();
    let oldFeeMake = await instance.feeMake.call();
    let oldFeeTake = await instance.feeTake.call();
    let oldFeeRebate = await instance.feeRebate.call();
    let putativeFeeMake = await web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    let putativeFeeTake = await web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    let putativeFeeRebate = await web3.utils.toBN(web3.utils.toWei('0.001', 'ether'));
    try {
      console.log("Trying...");
      await instance.changeFeeMake(putativeFeeMake, {from: currentAdmin});
      await instance.changeFeeTake(putativeFeeTake, {from: currentAdmin});
      await instance.changeFeeRebate(putativeFeeRebate, {from: currentAdmin});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newFeeMake = await instance.feeMake.call();
    let newFeeTake = await instance.feeTake.call();
    let newFeeRebate = await instance.feeRebate.call();
    console.log(oldFeeMake.toString(), newFeeMake.toString());
    // Do not compare BN/BigNumber objects
    // Instead, compare the string versions
    assert.equal(putativeFeeMake.toString(), newFeeMake.toString());
    assert.equal(putativeFeeTake.toString(), newFeeTake.toString());
    assert.equal(putativeFeeRebate.toString(), newFeeRebate.toString());
  });

  it("Try to change the no-fee period and fail", async () => {
    let instance = await Resardis.deployed();
    let currentAdmin = await instance.admin.call();
    let oldNoFeeUntil = await instance.noFeeUntil.call();
    let putativeNoFeeUntil_1 = await web3.utils.toBN(788918400);  // 1995/01/01
    let putativeNoFeeUntil_2 = await web3.utils.toBN(4102444800);  // 2100/01/01
    console.log("oldNoFeeUntil=", oldNoFeeUntil);
    console.log("putativeNoFeeUntil_1=", putativeNoFeeUntil_1);
    console.log("putativeNoFeeUntil_2=", putativeNoFeeUntil_2);

    try {
      // date is not allowed, but sending from admin
      console.log("Trying...");
      await instance.changeNoFeeUntil(putativeNoFeeUntil_1, {from: currentAdmin});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newNoFeeUntil_1 = await instance.noFeeUntil.call();

    try {
      // date is allowed but not sending from admin
      console.log("Trying...");
      await instance.changeNoFeeUntil(putativeNoFeeUntil_2, {from: accounts[6]});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newNoFeeUntil_2 = await instance.noFeeUntil.call();

    console.log("newNoFeeUntil_1=", newNoFeeUntil_1);
    console.log("newNoFeeUntil_2=", newNoFeeUntil_2);
    console.log("string sample=", newNoFeeUntil_1.toString())
    assert.equal(oldNoFeeUntil.toString(), newNoFeeUntil_1.toString());
    assert.equal(oldNoFeeUntil.toString(), newNoFeeUntil_2.toString());
  });

  it("Try to change the no-fee period and succeed", async () => {
    let instance = await Resardis.deployed();
    let currentAdmin = await instance.admin.call();
    let oldNoFeeUntil = await instance.noFeeUntil.call();
    let putativeNoFeeUntil = await web3.utils.toBN(4102444800);  // 2100/01/01
    console.log("oldNoFeeUntil=", oldNoFeeUntil);
    console.log("putativeNoFeeUntil=", putativeNoFeeUntil);

    try {
      // date is not allowed, but sending from admin
      console.log("Trying...");
      await instance.changeNoFeeUntil(putativeNoFeeUntil, {from: currentAdmin});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newNoFeeUntil = await instance.noFeeUntil.call();
    console.log("newNoFeeUntil=", newNoFeeUntil);
    console.log("string sample=", newNoFeeUntil.toString())
    assert.equal(putativeNoFeeUntil.toString(), newNoFeeUntil.toString());
  });

  it("Try to change the fee account and fail", async () => {
    let instance = await Resardis.deployed();
    let oldFeeAccount = await instance.feeAccount.call();
    let putativeFeeAccount = await accounts[2];
    console.log("oldFeeAccount=", oldFeeAccount);
    console.log("putativeFeeAccount=", putativeFeeAccount);
    try {
      console.log("Trying...");
      await instance.changeFeeAccount(putativeFeeAccount, {from: accounts[8]});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newFeeAccount = await instance.feeAccount.call();
    console.log("newFeeAccount=", newFeeAccount);
    assert.equal(oldFeeAccount, newFeeAccount);
  });

  it("Try to change the fee account and succeed", async () => {
    let instance = await Resardis.deployed();
    let currentAdmin = await instance.admin.call();
    let oldFeeAccount = await instance.feeAccount.call();
    let putativeFeeAccount = await accounts[2];
    console.log("oldFeeAccount=", oldFeeAccount);
    console.log("putativeFeeAccount=", putativeFeeAccount);
    try {
      console.log("Trying...");
      await instance.changeFeeAccount(putativeFeeAccount, {from: currentAdmin});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newFeeAccount = await instance.feeAccount.call();
    console.log("newFeeAccount=", newFeeAccount);
    assert.equal(putativeFeeAccount, newFeeAccount);
  });

  it("Try to change the account levels address and fail", async () => {
    let instance = await Resardis.deployed();
    let oldAccLevAddr = await instance.accountLevelsAddr.call();
    let putativeAccLevAddr = await accounts[5];
    console.log("oldAccLevAddr=", oldAccLevAddr);
    console.log("putativeAccLevAddr=", putativeAccLevAddr);
    try {
      console.log("Trying...");
      await instance.changeAccountLevelsAddr(putativeAccLevAddr, {from: account[6]});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newAccLevAddr = await instance.accountLevelsAddr.call();
    console.log("newAccLevAddr=", newAccLevAddr);
    assert.equal(oldAccLevAddr, newAccLevAddr);
  });

  it("Try to change the account levels address and succeed", async () => {
    let instance = await Resardis.deployed();
    let currentAdmin = await instance.admin.call();
    let oldAccLevAddr = await instance.accountLevelsAddr.call();
    let putativeAccLevAddr = await accounts[5];
    console.log("oldAccLevAddr=", oldAccLevAddr);
    console.log("putativeAccLevAddr=", putativeAccLevAddr);
    try {
      console.log("Trying...");
      await instance.changeAccountLevelsAddr(putativeAccLevAddr, {from: currentAdmin});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newAccLevAddr = await instance.accountLevelsAddr.call();
    console.log("newAccLevAddr=", newAccLevAddr);
    assert.equal(putativeAccLevAddr, newAccLevAddr);
  });

  it("Try to change the admin account and fail", async () => {
    let instance = await Resardis.deployed();
    let oldAdmin = await instance.admin.call();
    let putativeAdmin = await accounts[2];
    console.log("oldAdmin=", oldAdmin);
    console.log("putativeAdmin=", putativeAdmin);
    try {
      console.log("Trying...");
      await instance.changeAdmin(putativeAdmin, {from: putativeAdmin});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newAdmin = await instance.admin.call();
    console.log("newAdmin=", newAdmin);
    assert.equal(oldAdmin, newAdmin);
  });

  it("Try to change the admin account and succeed", async () => {
    let instance = await Resardis.deployed();
    let oldAdmin = await instance.admin.call();
    let putativeAdmin = await accounts[2];
    console.log("oldAdmin=", oldAdmin);
    console.log("putativeAdmin=", putativeAdmin);
    try {
      console.log("Trying...");
      await instance.changeAdmin(putativeAdmin, {from: oldAdmin});
    }
    catch(err) {
      console.log("Error catched");
      //Error = err;
    }
    let newAdmin = await instance.admin.call();
    console.log("newAdmin=", newAdmin);
    assert.equal(putativeAdmin, newAdmin);
  });
});
