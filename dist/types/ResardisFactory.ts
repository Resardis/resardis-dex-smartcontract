/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, Signer } from "ethers";
import { Provider } from "ethers/providers";

import { Resardis } from "./Resardis";

export class ResardisFactory {
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Resardis {
    return new Contract(address, _abi, signerOrProvider) as Resardis;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "admin_",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256"
      }
    ],
    name: "Deposit",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "LogItemUpdate",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "pair",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "maker",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "payAmt",
        type: "uint128"
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "buyAmt",
        type: "uint128"
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "timestamp",
        type: "uint64"
      }
    ],
    name: "LogKill",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "bytes32",
        name: "id",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "pair",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "maker",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "payAmt",
        type: "uint128"
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "buyAmt",
        type: "uint128"
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "timestamp",
        type: "uint64"
      }
    ],
    name: "LogMake",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "minAmount",
        type: "uint256"
      }
    ],
    name: "LogMinSell",
    type: "event"
  },
  {
    anonymous: true,
    inputs: [
      {
        indexed: true,
        internalType: "bytes4",
        name: "sig",
        type: "bytes4"
      },
      {
        indexed: true,
        internalType: "address",
        name: "guy",
        type: "address"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "foo",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "bar",
        type: "bytes32"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wad",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "bytes",
        name: "fax",
        type: "bytes"
      }
    ],
    name: "LogNote",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "authority",
        type: "address"
      }
    ],
    name: "LogSetAuthority",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    name: "LogSetOwner",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "LogSortedOffer",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "bytes32",
        name: "id",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "bytes32",
        name: "pair",
        type: "bytes32"
      },
      {
        indexed: true,
        internalType: "address",
        name: "maker",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        indexed: true,
        internalType: "address",
        name: "taker",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "takeAmt",
        type: "uint128"
      },
      {
        indexed: false,
        internalType: "uint128",
        name: "giveAmt",
        type: "uint128"
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "timestamp",
        type: "uint64"
      }
    ],
    name: "LogTake",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "buyGem",
        type: "address"
      }
    ],
    name: "LogTrade",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        indexed: false,
        internalType: "address",
        name: "user",
        type: "address"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "balance",
        type: "uint256"
      }
    ],
    name: "Withdraw",
    type: "event"
  },
  {
    constant: true,
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "allowedDepositTokens",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "allowedWithdrawTokens",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "authority",
    outputs: [
      {
        internalType: "contract DSAuthority",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "user",
        type: "address"
      }
    ],
    name: "balanceInUse",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "address",
        name: "user",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "best",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "buy",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "maxFillAmount",
        type: "uint256"
      }
    ],
    name: "buyAllAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "fillAmt",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "cancel",
    outputs: [
      {
        internalType: "bool",
        name: "success",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address"
      },
      {
        internalType: "bool",
        name: "depositPermit_",
        type: "bool"
      },
      {
        internalType: "bool",
        name: "withdrawPermit_",
        type: "bool"
      }
    ],
    name: "changeAllowedToken",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [],
    name: "deposit",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "depositToken",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "dust",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "dustId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address"
      }
    ],
    name: "getAllowedDepositToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "token_",
        type: "address"
      }
    ],
    name: "getAllowedWithdrawToken",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "sellGem",
        type: "address"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      }
    ],
    name: "getBestOffer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "getBetterOffer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      }
    ],
    name: "getBuyAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "fillAmt",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "getIdIndexProcessed",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "getIdIndexRaw",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      }
    ],
    name: "getMinSell",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "getOffer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "sellGem",
        type: "address"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      }
    ],
    name: "getOfferCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "getOwner",
    outputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      }
    ],
    name: "getPayAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "fillAmt",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "getSingleOfferFromHistory",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "bool",
        name: "",
        type: "bool"
      },
      {
        internalType: "bool",
        name: "",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "getWorseOffer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    name: "isActive",
    outputs: [
      {
        internalType: "bool",
        name: "active",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "lastOfferId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "lastOffersHistoryIndex",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "pos",
        type: "uint256"
      }
    ],
    name: "offer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "pos",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "rounding",
        type: "bool"
      }
    ],
    name: "offer",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      }
    ],
    name: "offer",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "offers",
    outputs: [
      {
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "timestamp",
        type: "uint64"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "offersHistory",
    outputs: [
      {
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "buyAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "uint64",
        name: "timestamp",
        type: "uint64"
      },
      {
        internalType: "uint256",
        name: "id",
        type: "uint256"
      },
      {
        internalType: "bool",
        name: "cancelled",
        type: "bool"
      },
      {
        internalType: "bool",
        name: "filled",
        type: "bool"
      },
      {
        internalType: "uint256",
        name: "filledPayAmt",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "filledBuyAmt",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "offersHistoryIndices",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    name: "rank",
    outputs: [
      {
        internalType: "uint256",
        name: "next",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "prev",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "delb",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "payAmt",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "buyGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "minFillAmount",
        type: "uint256"
      }
    ],
    name: "sellAllAmount",
    outputs: [
      {
        internalType: "uint256",
        name: "fillAmt",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract DSAuthority",
        name: "authority_",
        type: "address"
      }
    ],
    name: "setAuthority",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "payGem",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "dustAmt",
        type: "uint256"
      }
    ],
    name: "setMinSell",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "owner_",
        type: "address"
      }
    ],
    name: "setOwner",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "span",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "bytes32",
        name: "id",
        type: "bytes32"
      },
      {
        internalType: "uint128",
        name: "maxTakeAmount",
        type: "uint128"
      }
    ],
    name: "take",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "tokens",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      },
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    name: "tokensInUse",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "withdraw",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "withdrawToken",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function"
  }
];
