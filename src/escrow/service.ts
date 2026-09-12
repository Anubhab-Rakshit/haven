import type {
    CreateEscrowRequest,
    EscrowActionResult,
    EscrowDeploymentResult,
    EscrowRecord,
    EscrowState,
} from "./types";
import { EscrowState as State, ESCROW_STATE_LABELS } from "./types";
import {
    createEscrowWitnesses,
    generateSalt,
    generateSecret,
} from "./witnesses";
import {
    clearMemoryState,
    createInitialPrivateState,
    loadPrivateStateMemory,
    removePrivateStateMemory,
    savePrivateStateMemory,
    updatePrivateState,
} from "./private-state";
import { isValidTransition } from "./contract";
import {
    verifyAmount,
    verifyCondition,
    computeEscrowHash,
} from "./verification";

// ─── In-Memory Escrow Store ────────────────────────────────────────────────────
// Stores escrow records in memory. In production, this would be Supabase.

const escrowStore = new Map<string, EscrowRecord>();

// ─── Deploy Escrow ─────────────────────────────────────────────────────────────

/**
 * Creates a new escrow and deploys the contract to the network.
 *
 * This function:
 * 1. Validates the request parameters
 * 2. Generates buyer/seller secrets and a salt
 * 3. Creates the contract deployment with ZK witnesses
 * 4. Stores the private state locally
 * 5. Returns the deployment result
 *
 * @param request - The escrow creation parameters
 * @param provider - The Midnight wallet provider
 * @returns Deployment result with contract address and transaction hash
 */
export async function deployEscrow(
    request: CreateEscrowRequest,
    provider: MidnightProvider,
): Promise<EscrowDeploymentResult & { escrowId: string }> {
    // Validate inputs
    const amountCheck = verifyAmount(request.amount);
    if (!amountCheck.valid) {
        throw new Error(`Invalid amount: ${amountCheck.reason}`);
    }

    const conditionCheck = verifyCondition(request.condition);
    if (!conditionCheck.valid) {
        throw new Error(`Invalid condition: ${conditionCheck.reason}`);
    }

    // Generate secrets
    const buyerSecret = generateSecret();
    const sellerSecret = generateSecret();
    const salt = generateSalt();

    // Create witnesses
    const witnesses = createEscrowWitnesses(
        buyerSecret,
        sellerSecret,
        request.amount,
        request.condition,
    );

    // Deploy contract (this would call the Midnight SDK)
    // For now, we simulate the deployment
    const contractAddress = `mn_contract_${Date.now().toString(16)}`;
    const transactionHash = `mn_tx_${Date.now().toString(16)}`;

    // Generate escrow ID
    const escrowId = computeEscrowHash({
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
        amount: request.amount,
        condition: request.condition,
        timestamp: new Date().toISOString(),
    });

    // Create escrow record
    const record: EscrowRecord = {
        id: escrowId,
        contractAddress,
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
        amount: request.amount,
        condition: request.condition,
        state: State.Created,
        stateLabel: ESCROW_STATE_LABELS[State.Created],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        fundedAt: null,
        deliveredAt: null,
        releasedAt: null,
        disputedAt: null,
        resolvedAt: null,
        cancelledAt: null,
        transactionHash,
        buyerSecret,
        sellerSecret,
        salt,
    };

    // Store the record
    escrowStore.set(escrowId, record);

    // Store private state
    const privateState = createInitialPrivateState({
        buyerSecret,
        sellerSecret,
        amount: request.amount,
        condition: request.condition,
        salt,
        contractAddress,
        buyerAddress: request.buyerAddress,
        sellerAddress: request.sellerAddress,
    });
    savePrivateStateMemory(escrowId, privateState);

    return {
        escrowId,
        contractAddress,
        transactionHash,
        buyerCommitment: `commitment_${buyerSecret.slice(0, 16)}`,
        sellerCommitment: `commitment_${sellerSecret.slice(0, 16)}`,
        amountCommitment: `commitment_${request.amount.slice(0, 16)}`,
        conditionCommitment: `commitment_${request.condition.slice(0, 16)}`,
    };
}

// ─── Escrow Actions ────────────────────────────────────────────────────────────

/**
 * Deposits funds into the escrow (STATE_CREATED → STATE_FUNDED).
 */
export async function depositFunds(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "deposit", secret, provider);
}

/**
 * Confirms delivery (STATE_FUNDED → STATE_DELIVERED).
 */
export async function confirmDelivery(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "confirmDelivery", secret, provider);
}

/**
 * Releases funds to seller (STATE_DELIVERED → STATE_RELEASED).
 */
export async function releaseFunds(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "release", secret, provider);
}

/**
 * Raises a dispute (STATE_FUNDED/STATE_DELIVERED → STATE_DISPUTED).
 */
export async function raiseDispute(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "dispute", secret, provider);
}

/**
 * Resolves a dispute (STATE_DISPUTED → STATE_RESOLVED).
 */
export async function resolveDispute(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "resolve", secret, provider);
}

/**
 * Cancels the escrow (STATE_CREATED → STATE_CANCELLED).
 */
export async function cancelEscrow(
    escrowId: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    return performEscrowAction(escrowId, "cancel", secret, provider);
}

// ─── Internal Action Handler ───────────────────────────────────────────────────

async function performEscrowAction(
    escrowId: string,
    action: string,
    secret: string,
    provider: MidnightProvider,
): Promise<EscrowActionResult> {
    const record = escrowStore.get(escrowId);
    if (!record) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: State.Created,
            error: `Escrow ${escrowId} not found`,
        };
    }

    // Validate the action is allowed in the current state
    if (!isValidTransition(record.state, action as any)) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: record.state,
            error: `Cannot perform ${action} in state ${ESCROW_STATE_LABELS[record.state]}`,
        };
    }

    // Verify the secret matches the appropriate party
    const isBuyer = secret === record.buyerSecret;
    const isSeller = secret === record.sellerSecret;

    if (action === "confirmDelivery" || action === "resolve") {
        if (!isSeller) {
            return {
                success: false,
                transactionHash: "",
                blockHeight: 0,
                newState: record.state,
                error: "Only the seller can perform this action",
            };
        }
    } else if (!isBuyer && !isSeller) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: record.state,
            error: "Invalid secret for this escrow",
        };
    }

    // Determine new state
    const stateTransitions: Record<string, EscrowState> = {
        deposit: State.Funded,
        confirmDelivery: State.Delivered,
        release: State.Released,
        dispute: State.Disputed,
        resolve: State.Resolved,
        cancel: State.Cancelled,
    };

    const newState = stateTransitions[action];
    if (newState === undefined) {
        return {
            success: false,
            transactionHash: "",
            blockHeight: 0,
            newState: record.state,
            error: `Unknown action: ${action}`,
        };
    }

    // Simulate on-chain transaction
    const transactionHash = `mn_tx_${action}_${Date.now().toString(16)}`;
    const blockHeight = Math.floor(Math.random() * 1000000);

    // Update the record
    const now = new Date().toISOString();
    const updatedRecord: EscrowRecord = {
        ...record,
        state: newState,
        stateLabel: ESCROW_STATE_LABELS[newState],
        updatedAt: now,
        ...(action === "deposit" && { fundedAt: now }),
        ...(action === "confirmDelivery" && { deliveredAt: now }),
        ...(action === "release" && { releasedAt: now }),
        ...(action === "dispute" && { disputedAt: now }),
        ...(action === "resolve" && { resolvedAt: now }),
        ...(action === "cancel" && { cancelledAt: now }),
        transactionHash,
    };

    escrowStore.set(escrowId, updatedRecord);

    // Update private state
    const privateState = loadPrivateStateMemory(escrowId);
    if (privateState) {
        const updatedPrivateState = updatePrivateState(privateState, newState);
        savePrivateStateMemory(escrowId, updatedPrivateState);
    }

    return {
        success: true,
        transactionHash,
        blockHeight,
        newState,
    };
}

// ─── Query Functions ───────────────────────────────────────────────────────────

/**
 * Gets an escrow record by ID.
 */
export function getEscrow(escrowId: string): EscrowRecord | null {
    return escrowStore.get(escrowId) ?? null;
}

/**
 * Lists all escrows, optionally filtered.
 */
export function listEscrows(filters?: {
    state?: EscrowState;
    buyerAddress?: string;
    sellerAddress?: string;
}): EscrowRecord[] {
    let records = Array.from(escrowStore.values());

    if (filters?.state !== undefined) {
        records = records.filter((r) => r.state === filters.state);
    }
    if (filters?.buyerAddress) {
        records = records.filter(
            (r) => r.buyerAddress === filters.buyerAddress,
        );
    }
    if (filters?.sellerAddress) {
        records = records.filter(
            (r) => r.sellerAddress === filters.sellerAddress,
        );
    }

    return records.sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/**
 * Gets the private state for an escrow.
 */
export function getEscrowPrivateState(escrowId: string) {
    return loadPrivateStateMemory(escrowId);
}

/**
 * Removes an escrow and its private state.
 */
export function removeEscrow(escrowId: string): boolean {
    const deleted = escrowStore.delete(escrowId);
    removePrivateStateMemory(escrowId);
    return deleted;
}

/**
 * Clears all escrow data (for testing).
 */
export function clearAllEscrows(): void {
    escrowStore.clear();
    clearMemoryState();
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MidnightProvider {
    isConnected: boolean;
    address?: string;
    sign?: (data: string) => Promise<string>;
}
