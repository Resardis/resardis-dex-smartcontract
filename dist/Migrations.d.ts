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

interface MigrationsInterface extends Interface {
  functions: {
    last_completed_migration: TypedFunctionDescription<{
      encode([]: []): string;
    }>;

    owner: TypedFunctionDescription<{ encode([]: []): string }>;

    setCompleted: TypedFunctionDescription<{
      encode([completed]: [BigNumberish]): string;
    }>;

    upgrade: TypedFunctionDescription<{
      encode([new_address]: [string]): string;
    }>;
  };

  events: {};
}

export class Migrations extends Contract {
  connect(signerOrProvider: Signer | Provider | string): Migrations;
  attach(addressOrName: string): Migrations;
  deployed(): Promise<Migrations>;

  on(event: EventFilter | string, listener: Listener): Migrations;
  once(event: EventFilter | string, listener: Listener): Migrations;
  addListener(eventName: EventFilter | string, listener: Listener): Migrations;
  removeAllListeners(eventName: EventFilter | string): Migrations;
  removeListener(eventName: any, listener: Listener): Migrations;

  interface: MigrationsInterface;

  functions: {
    last_completed_migration(
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;

    "last_completed_migration()"(
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;

    owner(overrides?: TransactionOverrides): Promise<string>;

    "owner()"(overrides?: TransactionOverrides): Promise<string>;

    setCompleted(
      completed: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    "setCompleted(uint256)"(
      completed: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    upgrade(
      new_address: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;

    "upgrade(address)"(
      new_address: string,
      overrides?: TransactionOverrides
    ): Promise<ContractTransaction>;
  };

  last_completed_migration(
    overrides?: TransactionOverrides
  ): Promise<BigNumber>;

  "last_completed_migration()"(
    overrides?: TransactionOverrides
  ): Promise<BigNumber>;

  owner(overrides?: TransactionOverrides): Promise<string>;

  "owner()"(overrides?: TransactionOverrides): Promise<string>;

  setCompleted(
    completed: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  "setCompleted(uint256)"(
    completed: BigNumberish,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  upgrade(
    new_address: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  "upgrade(address)"(
    new_address: string,
    overrides?: TransactionOverrides
  ): Promise<ContractTransaction>;

  filters: {};

  estimate: {
    last_completed_migration(
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;

    "last_completed_migration()"(
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;

    owner(overrides?: TransactionOverrides): Promise<BigNumber>;

    "owner()"(overrides?: TransactionOverrides): Promise<BigNumber>;

    setCompleted(
      completed: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;

    "setCompleted(uint256)"(
      completed: BigNumberish,
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;

    upgrade(
      new_address: string,
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;

    "upgrade(address)"(
      new_address: string,
      overrides?: TransactionOverrides
    ): Promise<BigNumber>;
  };
}
