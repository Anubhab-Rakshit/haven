// ─── Midnight Lock ─────────────────────────────────────────────────────────────
// Private Escrow with ZK Condition Verification
//
// This module provides the core backend for Midnight Lock, a decentralized
// escrow service that uses Midnight's ZK proofs to keep amounts, conditions,
// and participant identities private while maintaining verifiable state.

// ─── Types ─────────────────────────────────────────────────────────────────────
export {
    EscrowState,
    ESCROW_STATE_LABELS,
    type EscrowParams,
    type EscrowCommitment,
    type EscrowRecord,
    type EscrowDeploymentResult,
    type EscrowActionResult,
    type EscrowWitnesses,
    type CreateEscrowRequest,
    type EscrowActionRequest,
    type EscrowFilter,
    type OnChainEscrowState,
    type EscrowTransaction,
    type VerificationResult,
    type SettlementProof,
} from "./types";

// ─── Witnesses ─────────────────────────────────────────────────────────────────
export {
    createEscrowWitnesses,
    createWitnessesFromRecord,
    generateSecret,
    generateSalt,
} from "./witnesses";

// ─── Private State ─────────────────────────────────────────────────────────────
export {
    type PrivateEscrowState,
    serializePrivateState,
    deserializePrivateState,
    savePrivateState,
    loadPrivateState,
    removePrivateState,
    listPrivateStateIds,
    savePrivateStateMemory,
    loadPrivateStateMemory,
    removePrivateStateMemory,
    clearMemoryState,
    createInitialPrivateState,
    updatePrivateState,
} from "./private-state";

// ─── Contract ──────────────────────────────────────────────────────────────────
export {
    loadEscrowContract,
    CIRCUITS,
    LEDGER_FIELDS,
    VALID_TRANSITIONS,
    isValidTransition,
    getValidCircuits,
    type CompiledEscrowContract,
    type ContractInfo,
    type CircuitName,
} from "./contract";

// ─── Service ───────────────────────────────────────────────────────────────────
export {
    deployEscrow,
    depositFunds,
    confirmDelivery,
    releaseFunds,
    raiseDispute,
    resolveDispute,
    cancelEscrow,
    getEscrow,
    listEscrows,
    getEscrowPrivateState,
    removeEscrow,
    clearAllEscrows,
} from "./service";

// ─── Verification ──────────────────────────────────────────────────────────────
export {
    verifyStateTransition,
    verifyAddressCommitment,
    verifyAmount,
    verifyCondition,
    computeEscrowHash,
    validateEscrowRecord,
} from "./verification";

// ─── Indexer ───────────────────────────────────────────────────────────────────
export {
    fetchEscrowState,
    fetchEscrowTransactions,
    fetchLatestBlock,
    contractExists,
    getEscrowSummary,
} from "./indexer";
