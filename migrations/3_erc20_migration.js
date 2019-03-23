const erc20 = artifacts.require("ERC20");

module.exports = function(deployer, network, accounts) {
  if (network == "development") {
    deployer.deploy(erc20);
  }
};
