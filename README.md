## Table of Contents
+ [Development](#development)
    + [Python Dependencies](#python-dependencies)
    + [JavaScript Dependencies](#javascript-dependencies)
    + [Deploying and Testing](#deploying-and-testing)

## Development
### Python Dependencies
+ The project uses several smart-contract security analysis tools written in Python, namely
`mythril`, `slither` and `manticore`.

+ For `mythril`, you need the following:
```shell
# Install libssl-dev, python3-dev
sudo apt install libssl-dev python3-dev
```

+ Install solidity compiler (`solc`) using snap (Debian/Ubuntu):
```shell
sudo apt-get update
sudo apt-get install snapd
sudo snap install solc
```

+ Create a new `python3` virtual environment and activate it using:
```shell
python3 -m venv /path/to/new/virtual/environment
source /path/to/new/virtual/environment/bin/activate
```
In Linux, you might need to install `python3-venv` package (in Debian-based distros) before executing the code above.

While the venv is activated, update `pip` and `setuptools` and install `pip-tools` using:
```shell
pip install --no-cache-dir -U pip
pip install --no-cache-dir -U setuptools
pip install --no-cache-dir wheel
pip install --no-cache-dir pip-tools
```

+ Now sync the env with the `dev-requirements.txt` which has freezed list of Python packages.
```shell
pip-sync dev-requirements.txt
```

### JavaScript Dependencies
+ `Yarn` is being used as the package manager for `Node.js` modules, and `truffle` as the development and testing toolbox.

+ Install `Node.js` as a [Snap](https://snapcraft.io/) package (see [Node.js snap](https://github.com/nodesource/distributions/blob/master/README.md#snap)):
```shell
sudo apt-get update
sudo apt-get install snapd
sudo snap install node --channel=10/stable --classic
which -a node npm yarn  # confirm paths
```

+ `git clone` the repository.

+ Install dependencies with `yarn`. Local installation into the project folder:
```shell
cd <projectDir>
yarn install
```
+ Locally installed binaries can be called using `yarn commandName` while in the project folder if you don't want to tweak `PATH`.

### Deploying and Testing
#### Linting
```shell
cd <projectDir>
yarn lint:sol # Solidity linting
yarn lint:sol:fix
yarn lint:js # JavaScript linting
yarn lint:js:fix
```

#### Deploying to Rinkeby
`contracts/test` directory has sample contracts that can be deployed on Eth network.
+ First, create rinkeby keys: `yarn gen:rinkeby-key`
+ Put ETH into the rinkeby account.
+ Set Infura keys for rinkeby: `export INFURA_API_KEY=XXXX`
+ Deploy to rinkeby: `yarn deploy:rinkeby`

#### Deploying to Matic Testnet
+ List of the networks and the corresponding block explorers can be found at [https://docs.matic.network/docs/integrate/network/](https://docs.matic.network/docs/integrate/network/)
+ Currently, `truffle-config.js` has `https://rpc-mumbai.matic.today/` as the active testnet.
+ `truffle` reads the account mnemonic that will be used to deploy to Matic testnet from `private/test-mnemonic`, which is a one-line file containing only the mnemonic.
+ Matic version of ETH is also needed to deploy. Get it from [https://faucet.matic.network/](https://faucet.matic.network/).
+ Deploy to Matic testnet: `yarn deploy:matic:testnet`

#### Unit Testing
```shell
yarn test # Deploy using truffle and apply unit tests
```

#### Security Testing
Activate the python venv:
```shell
source /path/to/new/virtual/environment/bin/activate
cd <projectDir>
```
Run security analysis tools:
```shell
manticore ./contracts/dex.sol
myth analyze ./contracts/dex.sol --execution-timeout <sec> --max-depth <number>
slither ./contracts/dex.sol
```
#### TODO
+ The old markets use dsmath. Ensure that math ops are done using uint256. Also, I have seen places where "/" is used instead of div.
+ In expiring market, DSauth is only used once (auth modifier). Verify that. If so, might want to replace it with something simpler.
Last: Check chained import references in expiring and matching.
+ Array of dynamic size vs static size and gas relation.
+ Cancel/kill offer and new offer variables.
+ Offer Position-dependent testing.
+ lastOffersHistoryIndex does not work as expected. It is actually not the last, but last + 1.
+ Allowed disallowed token code parts and tests.
+ Owner vs user name convention in parameters and returns.
+ Check freezing time
+ isClosed() || msg.sender == getOwner(id) || id == dustId, in can_cancel
+ getSingleOfferFromHistory ve getOffer isActive contexinde
+ Is take function necessary, if yes consider changing it to internal maybe?
+ Unsorted list and keepers:
> If matchingEnabled true(default), then inserted offers are matched. Except the ones inserted by contracts, because those end up in the unsorted list of offers, that must be later sorted by keepers using insert(). If matchingEnabled is false then MatchingMarket is reverted to ExpiringMarket, and matching is not done, and sorted lists are disabled.

+ Error messages to all require().
+ Cancel dust amount somewhere automatically.
+ Rounding precision and function overloading in offer method.
+ _findpos() and _find() and hinting mechanism
+ _matcho unnecessarily loops if the token balance is not sufficient.
+ Permanent order history in Fill-or-kill order types
+ Non-functional whitelisted tokens
+ `tokensInUse` and `tokens` balances check in higher level: maybe in `_matcho()` or `offer()`.
+ Gas optimization, variable packing. Specifically, optimization for the while loop in `_matcho()`. Also, observe the bytecode size.
+ Array slicing and performance consideration.
+ Remove all the work involving changes and removals of array elements and migrate those to `TheGraph`.
+ Bytecode size is now too big, thus we temporarily reduced `solc` optimizer runs from `999999990`. After the clean-up, this should be increased again.
