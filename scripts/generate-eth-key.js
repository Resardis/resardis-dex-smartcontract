'use strict';

// This script generates a new BIP39 mnemonic and writes it out to a file in the parent directory,
// it also generates the a key from the mnemonic and writes that out to a file in the parent
// directory. The script expects 1-2 arguments, the first must specify the prefix to use for the
// generated files, the second argument may be used to specify the mnemonic to use instead of
// generating a new one.

const fs = require('fs');
const path = require('path');
const bip39 = require('bip39');
const hdkey = require('ethereumjs-wallet/hdkey');

const prefix = 'rinkeby';

const mnemonic = bip39.generateMnemonic();

const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeedSync(mnemonic));
const walletHdpath = 'm/44\'/60\'/0\'/0/';

const wallet = hdwallet.derivePath(walletHdpath + '0').getWallet();

fs.writeFileSync(path.join(__dirname, `../${prefix}_account`), '0x' + wallet.getAddress().toString('hex'));
fs.writeFileSync(path.join(__dirname, `../${prefix}_mnemonic`), mnemonic);
fs.writeFileSync(path.join(__dirname, `../${prefix}_private_key`), wallet.getPrivateKey().toString('hex'));
