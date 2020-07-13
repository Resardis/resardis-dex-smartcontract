/* Generated by ts-generator ver. 0.0.8 */
/* tslint:disable */

import { Contract, ContractTransaction, EventFilter, Signer } from "ethers";
import { Listener, Provider } from "ethers/providers";
import { Arrayish, BigNumber, BigNumberish, Interface } from "ethers/utils";
import {
  TransactionOverrides,
  TypedEventDescription,
  TypedFunctionDescription
} from ".";

interface ResardisInterface extends Interface {
  functions: {
    admin: TypedFunctionDescription<{ encode([]: []): string }>;

    allowedDepositTokens: TypedFunctionDescription<{
      encode([]: [string]): string;
    }>;

    allowedWithdrawTokens: TypedFunctionDescription<{
      encode([]: [string]): string;
    }>;

    authority: TypedFunctionDescription<{ encode([]: []): string }>;

    balanceInUse: TypedFunctionDescription<{
      encode([token, user]: [string, string]): string;
    }>;

    balanceOf: TypedFunctionDescription<{
      encode([token, user]: [string, string]): string;
    }>;

    best: TypedFunctionDescription<{ encode([,]: [string, string]): string }>;

    buy: TypedFunctionDescription<{
      encode([id, amount]: [BigNumberish, BigNumberish]): string;
    }>;

    buyAllAmount: TypedFunctionDescription<{
      encode([buyGem, buyAmt, payGem, maxFillAmount]: [
        string,
        BigNumberish,
        string,
        BigNumberish
      ]): string;
    }>;

    cancel: TypedFunctionDescription<{ encode([id]: [BigNumberish]): string }>;

    changeAllowedToken: TypedFunctionDescription<{
      encode([token_, depositPermit_, withdrawPermit_]: [
        string,
        boolean,
        boolean
      ]): string;
    }>;

    deposit: TypedFunctionDescription<{ encode([]: []): string }>;

    depositToken: TypedFunctionDescription<{
      encode([token, amount]: [string, BigNumberish]): string;
    }>;

    dust: TypedFunctionDescription<{ encode([]: [string]): string }>;

    dustId: TypedFunctionDescription<{ encode([]: []): string }>;

    getAllowedDepositToken: TypedFunctionDescription<{
      encode([token_]: [string]): string;
    }>;

    getAllowedWithdrawToken: TypedFunctionDescription<{
      encode([token_]: [string]): string;
    }>;

    getBestOffer: TypedFunctionDescription<{
      encode([sellGem, buyGem]: [string, string]): string;
    }>;

    getBetterOffer: TypedFunctionDescription<{
      encode([id]: [BigNumberish]): string;
    }>;

    getBuyAmount: TypedFunctionDescription<{
      encode([buyGem, payGem, payAmt]: [string, string, BigNumberish]): string;
    }>;

    getIdIndexProcessed: TypedFunctionDescription<{
      encode([owner, id]: [string, BigNumberish]): string;
    }>;

    getIdIndexRaw: TypedFunctionDescription<{
      encode([owner, id]: [string, BigNumberish]): string;
    }>;

    getMinSell: TypedFunctionDescription<{
      encode([payGem]: [string]): string;
    }>;

    getOffer: TypedFunctionDescription<{
      encode([id]: [BigNumberish]): string;
    }>;

    getOfferCount: TypedFunctionDescription<{
      encode([sellGem, buyGem]: [string, string]): string;
    }>;

    getOwner: TypedFunctionDescription<{
      encode([id]: [BigNumberish]): string;
    }>;

    getPayAmount: TypedFunctionDescription<{
      encode([payGem, buyGem, buyAmt]: [string, string, BigNumberish]): string;
    }>;

    getSingleOfferFromHistory: TypedFunctionDescription<{
      encode([owner, id]: [string, BigNumberish]): string;
    }>;

    getWorseOffer: TypedFunctionDescription<{
      encode([id]: [BigNumberish]): string;
    }>;

    isActive: TypedFunctionDescription<{
      encode([id]: [BigNumberish]): string;
    }>;

    lastOfferId: TypedFunctionDescription<{ encode([]: []): string }>;

    lastOffersHistoryIndex: TypedFunctionDescription<{
      encode([]: [string]): string;
    }>;

    offer: TypedFunctionDescription<{
      encode([payAmt, payGem, buyAmt, buyGem, pos]: [
        BigNumberish,
        string,
        BigNumberish,
        string,
        BigNumberish
      ]): string;
    }>;

    offers: TypedFunctionDescription<{ encode([]: [BigNumberish]): string }>;

    offersHistory: TypedFunctionDescription<{
      encode([,]: [string, BigNumberish]): string;
    }>;

    offersHistoryIndices: TypedFunctionDescription<{
      encode([,]: [string, BigNumberish]): string;
    }>;

    owner: TypedFunctionDescription<{ encode([]: []): string }>;

    rank: TypedFunctionDescription<{ encode([]: [BigNumberish]): string }>;

    sellAllAmount: TypedFunctionDescription<{
      encode([payGem, payAmt, buyGem, minFillAmount]: [
        string,
        BigNumberish,
        string,
        BigNumberish
      ]): string;
    }>;

    setAuthority: TypedFunctionDescription<{
      encode([authority_]: [string]): string;
    }>;

    setMinSell: TypedFunctionDescription<{
      encode([payGem, dustAmt]: [string, BigNumberish]): string;
    }>;

    setOwner: TypedFunctionDescription<{ encode([owner_]: [string]): string }>;

    span: TypedFunctionDescription<{ encode([,]: [string, string]): string }>;

    take: TypedFunctionDescription<{
      encode([id, maxTakeAmount]: [Arrayish, BigNumberish]): string;
    }>;

    tokens: TypedFunctionDescription<{ encode([,]: [string, string]): string }>;

    tokensInUse: TypedFunctionDescription<{
      encode([,]: [string, string]): string;
    }>;

    withdraw: TypedFunctionDescription<{
      encode([amount]: [BigNumberish]): string;
    }>;

    withdrawToken: TypedFunctionDescription<{
      encode([token, amount]: [string, BigNumberish]): string;
    }>;
  };

  events: {
    Deposit: TypedEventDescription<{
      encodeTopics([token, user, amount, balance]: [
        null,
        null,
        null,
        null
      ]): string[];
    }>;

    LogItemUpdate: TypedEventDescription<{
      encodeTopics([id]: [null]): string[];
    }>;

    LogKill: TypedEventDescription<{
      encodeTopics([
        id,
        pair,
        maker,
        payGem,
        buyGem,
        payAmt,
        buyAmt,
        timestamp
      ]: [
        Arrayish | null,
        Arrayish | null,
        string | null,
        null,
        null,
        null,
        null,
        null
      ]): string[];
    }>;

    LogMake: TypedEventDescription<{
      encodeTopics([
        id,
        pair,
        maker,
        payGem,
        buyGem,
        payAmt,
        buyAmt,
        timestamp
      ]: [
        Arrayish | null,
        Arrayish | null,
        string | null,
        null,
        null,
        null,
        null,
        null
      ]): string[];
    }>;

    LogMinSell: TypedEventDescription<{
      encodeTopics([payGem, minAmount]: [null, null]): string[];
    }>;

    LogNote: TypedEventDescription<{
      encodeTopics([sig, guy, foo, bar, wad, fax]: [
        Arrayish | null,
        string | null,
        Arrayish | null,
        Arrayish | null,
        null,
        null
      ]): string[];
    }>;

    LogSetAuthority: TypedEventDescription<{
      encodeTopics([authority]: [string | null]): string[];
    }>;

    LogSetOwner: TypedEventDescription<{
      encodeTopics([owner]: [string | null]): string[];
    }>;

    LogSortedOffer: TypedEventDescription<{
      encodeTopics([id]: [null]): string[];
    }>;

    LogTake: TypedEventDescription<{
      encodeTopics([
        id,
        pair,
        maker,
        payGem,
        buyGem,
        taker,
        takeAmt,
        giveAmt,
        timestamp
      ]: [
        null,
        Arrayish | null,
        string | null,
        null,
        null,
        string | null,
        null,
        null,
        null
      ]): string[];
    }>;

    LogTrade: TypedEventDescription<{
      encodeTopics([payAmt, payGem, buyAmt, buyGem]: [
        null,
        string | null,
        null,
        string | null
      ]): string[];
    }>;

    Withdraw: TypedEventDescription<{
      encodeTopics([token, user, amount, balance]: [
        null,
        null,
        null,
        null
      ]): string[];
    }>;
  };
}

export class Resardis extends Contract {
  connect(signerOrProvider: Signer | Provider | string): Resardis;
  attach(addressOrName: string): Resardis;
  deployed(): Promise<Resardis>;

  on(event: EventFilter | string, listener: Listener): Resardis;
  once(event: EventFilter | string, listener: Listener): Resardis;
  addListener(eventName: EventFilter | string, listener: Listener): Resardis;
  removeAllListeners(eventName: EventFilter | string): Resardis;
  removeListener(eventName: any, listener: Listener): Resardis;

  interface: ResardisInterface;

  functions: {
    admin(): Promise<string>;

    allowedDepositTokens(arg0: string): Promise<boolean>;

    allowedWithdrawTokens(arg0: string): Promise<boolean>;

    authority(): Promise<string>;

    balanceInUse(token: string, user: string): Promise<BigNumber>;

    balanceOf(token: string, user: string): Promise<BigNumber>;

    best(arg0: string, arg1: string): Promise<BigNumber>;

    buy(
      id: BigNumberish,
      amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    buyAllAmount(
      buyGem: string,
      buyAmt: BigNumberish,
      payGem: string,
      maxFillAmount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    cancel(
      id: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    changeAllowedToken(
      token_: string,
      depositPermit_: boolean,
      withdrawPermit_: boolean,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    deposit(overrides?: TransactionOverrides): Promise<ContractTransaction>;

    depositToken(
      token: string,
      amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    dust(arg0: string): Promise<BigNumber>;

    dustId(): Promise<BigNumber>;

    getAllowedDepositToken(token_: string): Promise<boolean>;

    getAllowedWithdrawToken(token_: string): Promise<boolean>;

    getBestOffer(sellGem: string, buyGem: string): Promise<BigNumber>;

    getBetterOffer(id: BigNumberish): Promise<BigNumber>;

    getBuyAmount(
      buyGem: string,
      payGem: string,
      payAmt: BigNumberish
    ): Promise<BigNumber>;

    getIdIndexProcessed(owner: string, id: BigNumberish): Promise<BigNumber>;

    getIdIndexRaw(owner: string, id: BigNumberish): Promise<BigNumber>;

    getMinSell(payGem: string): Promise<BigNumber>;

    getOffer(
      id: BigNumberish
    ): Promise<{
      0: BigNumber;
      1: string;
      2: BigNumber;
      3: string;
    }>;

    getOfferCount(sellGem: string, buyGem: string): Promise<BigNumber>;

    getOwner(id: BigNumberish): Promise<string>;

    getPayAmount(
      payGem: string,
      buyGem: string,
      buyAmt: BigNumberish
    ): Promise<BigNumber>;

    getSingleOfferFromHistory(
      owner: string,
      id: BigNumberish
    ): Promise<{
      0: BigNumber;
      1: string;
      2: BigNumber;
      3: string;
      4: boolean;
      5: boolean;
      6: BigNumber;
      7: BigNumber;
    }>;

    getWorseOffer(id: BigNumberish): Promise<BigNumber>;

    isActive(id: BigNumberish): Promise<boolean>;

    lastOfferId(): Promise<BigNumber>;

    lastOffersHistoryIndex(arg0: string): Promise<BigNumber>;

    "offer(uint256,address,uint256,address,uint256)"(
      payAmt: BigNumberish,
      payGem: string,
      buyAmt: BigNumberish,
      buyGem: string,
      pos: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    "offer(uint256,address,uint256,address,uint256,bool)"(
      payAmt: BigNumberish,
      payGem: string,
      buyAmt: BigNumberish,
      buyGem: string,
      pos: BigNumberish,
      rounding: boolean,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    "offer(uint256,address,uint256,address)"(
      payAmt: BigNumberish,
      payGem: string,
      buyAmt: BigNumberish,
      buyGem: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    offers(
      arg0: BigNumberish
    ): Promise<{
      payAmt: BigNumber;
      payGem: string;
      buyAmt: BigNumber;
      buyGem: string;
      owner: string;
      timestamp: BigNumber;
      0: BigNumber;
      1: string;
      2: BigNumber;
      3: string;
      4: string;
      5: BigNumber;
    }>;

    offersHistory(
      arg0: string,
      arg1: BigNumberish
    ): Promise<{
      payAmt: BigNumber;
      payGem: string;
      buyAmt: BigNumber;
      buyGem: string;
      owner: string;
      timestamp: BigNumber;
      id: BigNumber;
      cancelled: boolean;
      filled: boolean;
      filledPayAmt: BigNumber;
      filledBuyAmt: BigNumber;
      0: BigNumber;
      1: string;
      2: BigNumber;
      3: string;
      4: string;
      5: BigNumber;
      6: BigNumber;
      7: boolean;
      8: boolean;
      9: BigNumber;
      10: BigNumber;
    }>;

    offersHistoryIndices(arg0: string, arg1: BigNumberish): Promise<BigNumber>;

    owner(): Promise<string>;

    rank(
      arg0: BigNumberish
    ): Promise<{
      next: BigNumber;
      prev: BigNumber;
      delb: BigNumber;
      0: BigNumber;
      1: BigNumber;
      2: BigNumber;
    }>;

    sellAllAmount(
      payGem: string,
      payAmt: BigNumberish,
      buyGem: string,
      minFillAmount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setAuthority(
      authority_: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setMinSell(
      payGem: string,
      dustAmt: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    setOwner(
      owner_: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    span(arg0: string, arg1: string): Promise<BigNumber>;

    take(
      id: Arrayish,
      maxTakeAmount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    tokens(arg0: string, arg1: string): Promise<BigNumber>;

    tokensInUse(arg0: string, arg1: string): Promise<BigNumber>;

    withdraw(
      amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    withdrawToken(
      token: string,
      amount: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;
  };

  admin(): Promise<string>;

  allowedDepositTokens(arg0: string): Promise<boolean>;

  allowedWithdrawTokens(arg0: string): Promise<boolean>;

  authority(): Promise<string>;

  balanceInUse(token: string, user: string): Promise<BigNumber>;

  balanceOf(token: string, user: string): Promise<BigNumber>;

  best(arg0: string, arg1: string): Promise<BigNumber>;

  buy(
    id: BigNumberish,
    amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  buyAllAmount(
    buyGem: string,
    buyAmt: BigNumberish,
    payGem: string,
    maxFillAmount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  cancel(
    id: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  changeAllowedToken(
    token_: string,
    depositPermit_: boolean,
    withdrawPermit_: boolean,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  deposit(overrides?: TransactionOverrides): Promise<ContractTransaction>;

  depositToken(
    token: string,
    amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  dust(arg0: string): Promise<BigNumber>;

  dustId(): Promise<BigNumber>;

  getAllowedDepositToken(token_: string): Promise<boolean>;

  getAllowedWithdrawToken(token_: string): Promise<boolean>;

  getBestOffer(sellGem: string, buyGem: string): Promise<BigNumber>;

  getBetterOffer(id: BigNumberish): Promise<BigNumber>;

  getBuyAmount(
    buyGem: string,
    payGem: string,
    payAmt: BigNumberish
  ): Promise<BigNumber>;

  getIdIndexProcessed(owner: string, id: BigNumberish): Promise<BigNumber>;

  getIdIndexRaw(owner: string, id: BigNumberish): Promise<BigNumber>;

  getMinSell(payGem: string): Promise<BigNumber>;

  getOffer(
    id: BigNumberish
  ): Promise<{
    0: BigNumber;
    1: string;
    2: BigNumber;
    3: string;
  }>;

  getOfferCount(sellGem: string, buyGem: string): Promise<BigNumber>;

  getOwner(id: BigNumberish): Promise<string>;

  getPayAmount(
    payGem: string,
    buyGem: string,
    buyAmt: BigNumberish
  ): Promise<BigNumber>;

  getSingleOfferFromHistory(
    owner: string,
    id: BigNumberish
  ): Promise<{
    0: BigNumber;
    1: string;
    2: BigNumber;
    3: string;
    4: boolean;
    5: boolean;
    6: BigNumber;
    7: BigNumber;
  }>;

  getWorseOffer(id: BigNumberish): Promise<BigNumber>;

  isActive(id: BigNumberish): Promise<boolean>;

  lastOfferId(): Promise<BigNumber>;

  lastOffersHistoryIndex(arg0: string): Promise<BigNumber>;

  "offer(uint256,address,uint256,address,uint256)"(
    payAmt: BigNumberish,
    payGem: string,
    buyAmt: BigNumberish,
    buyGem: string,
    pos: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  "offer(uint256,address,uint256,address,uint256,bool)"(
    payAmt: BigNumberish,
    payGem: string,
    buyAmt: BigNumberish,
    buyGem: string,
    pos: BigNumberish,
    rounding: boolean,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  "offer(uint256,address,uint256,address)"(
    payAmt: BigNumberish,
    payGem: string,
    buyAmt: BigNumberish,
    buyGem: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  offers(
    arg0: BigNumberish
  ): Promise<{
    payAmt: BigNumber;
    payGem: string;
    buyAmt: BigNumber;
    buyGem: string;
    owner: string;
    timestamp: BigNumber;
    0: BigNumber;
    1: string;
    2: BigNumber;
    3: string;
    4: string;
    5: BigNumber;
  }>;

  offersHistory(
    arg0: string,
    arg1: BigNumberish
  ): Promise<{
    payAmt: BigNumber;
    payGem: string;
    buyAmt: BigNumber;
    buyGem: string;
    owner: string;
    timestamp: BigNumber;
    id: BigNumber;
    cancelled: boolean;
    filled: boolean;
    filledPayAmt: BigNumber;
    filledBuyAmt: BigNumber;
    0: BigNumber;
    1: string;
    2: BigNumber;
    3: string;
    4: string;
    5: BigNumber;
    6: BigNumber;
    7: boolean;
    8: boolean;
    9: BigNumber;
    10: BigNumber;
  }>;

  offersHistoryIndices(arg0: string, arg1: BigNumberish): Promise<BigNumber>;

  owner(): Promise<string>;

  rank(
    arg0: BigNumberish
  ): Promise<{
    next: BigNumber;
    prev: BigNumber;
    delb: BigNumber;
    0: BigNumber;
    1: BigNumber;
    2: BigNumber;
  }>;

  sellAllAmount(
    payGem: string,
    payAmt: BigNumberish,
    buyGem: string,
    minFillAmount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setAuthority(
    authority_: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setMinSell(
    payGem: string,
    dustAmt: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  setOwner(
    owner_: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  span(arg0: string, arg1: string): Promise<BigNumber>;

  take(
    id: Arrayish,
    maxTakeAmount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  tokens(arg0: string, arg1: string): Promise<BigNumber>;

  tokensInUse(arg0: string, arg1: string): Promise<BigNumber>;

  withdraw(
    amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  withdrawToken(
    token: string,
    amount: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  filters: {
    Deposit(token: null, user: null, amount: null, balance: null): EventFilter;

    LogItemUpdate(id: null): EventFilter;

    LogKill(
      id: Arrayish | null,
      pair: Arrayish | null,
      maker: string | null,
      payGem: null,
      buyGem: null,
      payAmt: null,
      buyAmt: null,
      timestamp: null
    ): EventFilter;

    LogMake(
      id: Arrayish | null,
      pair: Arrayish | null,
      maker: string | null,
      payGem: null,
      buyGem: null,
      payAmt: null,
      buyAmt: null,
      timestamp: null
    ): EventFilter;

    LogMinSell(payGem: null, minAmount: null): EventFilter;

    LogNote(
      sig: Arrayish | null,
      guy: string | null,
      foo: Arrayish | null,
      bar: Arrayish | null,
      wad: null,
      fax: null
    ): EventFilter;

    LogSetAuthority(authority: string | null): EventFilter;

    LogSetOwner(owner: string | null): EventFilter;

    LogSortedOffer(id: null): EventFilter;

    LogTake(
      id: null,
      pair: Arrayish | null,
      maker: string | null,
      payGem: null,
      buyGem: null,
      taker: string | null,
      takeAmt: null,
      giveAmt: null,
      timestamp: null
    ): EventFilter;

    LogTrade(
      payAmt: null,
      payGem: string | null,
      buyAmt: null,
      buyGem: string | null
    ): EventFilter;

    Withdraw(token: null, user: null, amount: null, balance: null): EventFilter;
  };

  estimate: {
    admin(): Promise<BigNumber>;

    allowedDepositTokens(arg0: string): Promise<BigNumber>;

    allowedWithdrawTokens(arg0: string): Promise<BigNumber>;

    authority(): Promise<BigNumber>;

    balanceInUse(token: string, user: string): Promise<BigNumber>;

    balanceOf(token: string, user: string): Promise<BigNumber>;

    best(arg0: string, arg1: string): Promise<BigNumber>;

    buy(id: BigNumberish, amount: BigNumberish): Promise<BigNumber>;

    buyAllAmount(
      buyGem: string,
      buyAmt: BigNumberish,
      payGem: string,
      maxFillAmount: BigNumberish
    ): Promise<BigNumber>;

    cancel(id: BigNumberish): Promise<BigNumber>;

    changeAllowedToken(
      token_: string,
      depositPermit_: boolean,
      withdrawPermit_: boolean
    ): Promise<BigNumber>;

    deposit(): Promise<BigNumber>;

    depositToken(token: string, amount: BigNumberish): Promise<BigNumber>;

    dust(arg0: string): Promise<BigNumber>;

    dustId(): Promise<BigNumber>;

    getAllowedDepositToken(token_: string): Promise<BigNumber>;

    getAllowedWithdrawToken(token_: string): Promise<BigNumber>;

    getBestOffer(sellGem: string, buyGem: string): Promise<BigNumber>;

    getBetterOffer(id: BigNumberish): Promise<BigNumber>;

    getBuyAmount(
      buyGem: string,
      payGem: string,
      payAmt: BigNumberish
    ): Promise<BigNumber>;

    getIdIndexProcessed(owner: string, id: BigNumberish): Promise<BigNumber>;

    getIdIndexRaw(owner: string, id: BigNumberish): Promise<BigNumber>;

    getMinSell(payGem: string): Promise<BigNumber>;

    getOffer(id: BigNumberish): Promise<BigNumber>;

    getOfferCount(sellGem: string, buyGem: string): Promise<BigNumber>;

    getOwner(id: BigNumberish): Promise<BigNumber>;

    getPayAmount(
      payGem: string,
      buyGem: string,
      buyAmt: BigNumberish
    ): Promise<BigNumber>;

    getSingleOfferFromHistory(
      owner: string,
      id: BigNumberish
    ): Promise<BigNumber>;

    getWorseOffer(id: BigNumberish): Promise<BigNumber>;

    isActive(id: BigNumberish): Promise<BigNumber>;

    lastOfferId(): Promise<BigNumber>;

    lastOffersHistoryIndex(arg0: string): Promise<BigNumber>;

    offer(
      payAmt: BigNumberish,
      payGem: string,
      buyAmt: BigNumberish,
      buyGem: string,
      pos: BigNumberish
    ): Promise<BigNumber>;

    offers(arg0: BigNumberish): Promise<BigNumber>;

    offersHistory(arg0: string, arg1: BigNumberish): Promise<BigNumber>;

    offersHistoryIndices(arg0: string, arg1: BigNumberish): Promise<BigNumber>;

    owner(): Promise<BigNumber>;

    rank(arg0: BigNumberish): Promise<BigNumber>;

    sellAllAmount(
      payGem: string,
      payAmt: BigNumberish,
      buyGem: string,
      minFillAmount: BigNumberish
    ): Promise<BigNumber>;

    setAuthority(authority_: string): Promise<BigNumber>;

    setMinSell(payGem: string, dustAmt: BigNumberish): Promise<BigNumber>;

    setOwner(owner_: string): Promise<BigNumber>;

    span(arg0: string, arg1: string): Promise<BigNumber>;

    take(id: Arrayish, maxTakeAmount: BigNumberish): Promise<BigNumber>;

    tokens(arg0: string, arg1: string): Promise<BigNumber>;

    tokensInUse(arg0: string, arg1: string): Promise<BigNumber>;

    withdraw(amount: BigNumberish): Promise<BigNumber>;

    withdrawToken(token: string, amount: BigNumberish): Promise<BigNumber>;
  };
}
