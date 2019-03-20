const Resardis = artifacts.require("Resardis");

module.exports = function(deployer, network, accounts) {
  if (network == "development") {
    const admin = accounts[0];
    const feeAccount = accounts[1];
    const accountLevelsAddr = accounts[9];
    const feeMake = web3.utils.toBN(web3.utils.toWei('0.002', 'ether'));
    const feeTake = web3.utils.toBN(web3.utils.toWei('0.002', 'ether'));
    const feeRebate = web3.utils.toBN(web3.utils.toWei('0.002', 'ether'));
    const noFeeUntil = 1765497600;
    deployer.deploy(Resardis, admin, feeAccount, accountLevelsAddr, feeMake, feeTake, feeRebate, noFeeUntil);
  }
};
