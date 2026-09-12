// ─── Escrow State Machine ──────────────────────────────────────────────────────
// Each escrow follows a strict state machine enforced by the ZK contract.

export enum EscrowState {
    Created = 0,
    Funded = 1,
    Delivered = 2,
    Released = 3,
    Disputed = 4,
    Resolved = 5,
    Cancelled = 6,
}

export const ESCROW_STATE_LABELS: Record<EscrowState, string> = {
    [EscrowState.Created]: "Created",
    [EscrowState.Funded]: "Funded",
    [EscrowState.Delivered]: "Delivered",
    [EscrowState.Released]: "Released",
    [EscrowState.Disputed]: "Disputed",
    [EscrowState.Resolved]: "Resolved",
    [EscrowState.Cancelled]: "Cancelled",
};

// ─── Core Types ────────────────────────────────────────────────────────────────

export interface EscrowParams {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
}

export interface EscrowCommitment {
    buyerCommitment: string;
    sellerCommitment: string;
    amountCommitment: string;
    conditionCommitment: string;
}

export interface EscrowRecord {
    id: string;
    contractAddress: string;
    buyerAddress: string;
    sellerAddress: string;
    amount: string;
    condition: string;
    state: EscrowState;
    stateLabel: string;
    createdAt: string;
    updatedAt: string;
    fundedAt: string | null;
    deliveredAt: string | null;
    releasedAt: string | null;
    disputedAt: string | null;
    resolvedAt: string | null;
    cancelledAt: string | null;
    transactionHash: string;
    buyerSecret: string;
    sellerSecret: string;
    salt: string;
}

export interface EscrowDeploymentResult {
    contractAddress: string;
    transactionHash: string;
    buyerCommitment: string;
    sellerCommitment: string;
    amountCommitment: string;
    conditionCommitment: string;
}

export interface EscrowActionResult {
    success: boolean;
    transactionHash: string;
    blockHeight: number;
    newState: EscrowState;
    error?: string;
}

// ─── Witness Types ─────────────────────────────────────────────────────────────

export interface EscrowWitnesses {
    buyerSecret: () => string;
    sellerSecret: () => string;
    escrowAmount: () => string;
    conditionHash: () => string;
}

// ─── Service Types ─────────────────────────────────────────────────────────────

export interface CreateEscrowRequest {
    buyerAddress: string;
    sellerAddress: string;
    amount: string;
    condition: string;
}

export interface EscrowActionRequest {
    escrowId: string;
    contractAddress: string;
    secret: string;
}

export interface EscrowFilter {
    state?: EscrowState;
    buyerAddress?: string;
    sellerAddress?: string;
    createdAt?: {
        from?: string;
        to?: string;
    };
}

// ─── Indexer Types ─────────────────────────────────────────────────────────────

export interface OnChainEscrowState {
    buyerCommitment: string;
    sellerCommitment: string;
    amountCommitment: string;
    conditionCommitment: string;
    escrowState: number;
    depositCount: number;
    disputeCount: number;
}

export interface EscrowTransaction {
    hash: string;
    blockHeight: number;
    timestamp: string;
    type: string;
}

// ─── Verification Types ────────────────────────────────────────────────────────

export interface VerificationResult {
    valid: boolean;
    reason?: string;
    details?: Record<string, unknown>;
}

export interface SettlementProof {
    escrowId: string;
    finalState: EscrowState;
    transactionHash: string;
    timestamp: string;
}
