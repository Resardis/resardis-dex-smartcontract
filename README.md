## Table of Contents
+ [Development](#development)
    + [Creating the Dev Env](#creating-the-dev-env)

## Development
### Creating the Dev Env
+ `Yarn` is being used as the package manager for `Node.js` modules, and `truffle` as the development and testing toolbox.
+ Install `Node.js` as a [Snap](https://snapcraft.io/) package. But first, if you have previously messed up with Node.js or node module installation and want a fresh start (on Debian/Ubuntu):
```shell
npm root  # check local module directory
npm root -g  # check global module directory
sudo apt-get purge nodejs npm yarnpkg # depending on the distro/version, "nodejs" might be called as "node"
# Remember that depending on your config/distro, folders might differ
# Check the directories first as shown at the beginning of the snippet
sudo rm -rvf ~/node_modules ~/.node_modules /usr/local/lib/node_modules
```
You migth also want to check your `.bashrc` file for remaining `PATHS`.

Install [Node.js snap](https://github.com/nodesource/distributions/blob/master/README.md#snap):
```shell
sudo apt-get update
sudo apt-get install snapd
sudo snap install node --channel=10/stable --classic
which -a node npm yarn  # confirm paths
```
+ `git clone` the repository.

+ Install dependencies with `yarn`. Will be doing local installation into the project folder in order to not mess up with the global packages.:
```shell
cd <projectDir>
yarn install
```
+ Locally installed binaries can be called using `yarn commandName` while in the project folder if you don't want to tweak `PATH`.

Also see [Yarn Workflow](https://yarnpkg.com/en/docs/yarn-workflow).

### Deploying and Testing
```shell
cd <projectDir>
yarn solhint "contracts/**/*.sol"  # Linting
bash scripts/test.sh --network development  # Testing
```
