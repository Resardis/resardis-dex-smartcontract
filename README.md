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
