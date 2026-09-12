import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum EscrowState { STATE_CREATED = 0,
                          STATE_FUNDED = 1,
                          STATE_DELIVERED = 2,
                          STATE_RELEASED = 3,
                          STATE_DISPUTED = 4,
                          STATE_RESOLVED = 5,
                          STATE_CANCELLED = 6
}

export type Witnesses<PS> = {
  buyerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  sellerSecret(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  escrowAmount(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
  conditionHash(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>, value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  confirmDelivery(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  release(context: __compactRuntime.CircuitContext<PS>,
          sellerPubKey_0: { bytes: Uint8Array },
          coinIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dispute(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  resolve(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  cancel(context: __compactRuntime.CircuitContext<PS>, coinIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>, value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  confirmDelivery(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  release(context: __compactRuntime.CircuitContext<PS>,
          sellerPubKey_0: { bytes: Uint8Array },
          coinIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dispute(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  resolve(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  cancel(context: __compactRuntime.CircuitContext<PS>, coinIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
}

export type Circuits<PS> = {
  deposit(context: __compactRuntime.CircuitContext<PS>, value_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  confirmDelivery(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  release(context: __compactRuntime.CircuitContext<PS>,
          sellerPubKey_0: { bytes: Uint8Array },
          coinIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  dispute(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  resolve(context: __compactRuntime.CircuitContext<PS>): __compactRuntime.CircuitResults<PS, []>;
  cancel(context: __compactRuntime.CircuitContext<PS>, coinIndex_0: bigint): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  readonly buyerCommitment: Uint8Array;
  readonly sellerCommitment: Uint8Array;
  readonly amountCommitment: Uint8Array;
  readonly conditionCommitment: Uint8Array;
  readonly escrowState: EscrowState;
  readonly depositCount: bigint;
  readonly disputeCount: bigint;
  readonly depositedCoinNonce: Uint8Array;
  readonly depositedCoinColor: Uint8Array;
  readonly depositedCoinValue: bigint;
  readonly hasDeposit: boolean;
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
