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
import { getDeployedContractAddress } from "../network";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ─── Supabase Client ──────────────────────────────────────────────────────────
// Falls back to in-memory Map when Supabase env vars are not configured.

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (_supabase) return _supabase;
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return _supabase;
    }
    return null;
}

// ─── In-Memory Escrow Store (fallback) ─────────────────────────────────────────

const escrowStore = new Map<string, EscrowRecord>();

// ─── Supabase ↔ Type Mapping ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecord(row: any): EscrowRecord {
    return {
        id: row.id,
        contractAddress: row.contract_address,
        buyerAddress: row.buyer_address,
        sellerAddress: row.seller_address,
        amount: row.amount,
        condition: row.condition,
        state: row.state,
        stateLabel: row.state_label,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        fundedAt: row.funded_at,
        deliveredAt: row.delivered_at,
        releasedAt: row.released_at,
        disputedAt: row.disputed_at,
        resolvedAt: row.resolved_at,
        cancelledAt: row.cancelled_at,
        transactionHash: row.transaction_hash,
        buyerSecret: row.buyer_secret,
        sellerSecret: row.seller_secret,
        salt: row.salt,
    };
}

function recordToRow(record: EscrowRecord) {
    return {
        id: record.id,
        contract_address: record.contractAddress,
        buyer_address: record.buyerAddress,
        seller_address: record.sellerAddress,
        amount: record.amount,
        condition: record.condition,
        state: record.state,
        state_label: record.stateLabel,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        funded_at: record.fundedAt,
        delivered_at: record.deliveredAt,
        released_at: record.releasedAt,
        disputed_at: record.disputedAt,
        resolved_at: record.resolvedAt,
        cancelled_at: record.cancelledAt,
        transaction_hash: record.transactionHash,
        buyer_secret: record.buyerSecret,
        seller_secret: record.sellerSecret,
        salt: record.salt,
    };
}

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
    _provider: MidnightProvider,
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
    const _witnesses = createEscrowWitnesses(
        buyerSecret,
        sellerSecret,
        request.amount,
        request.condition,
    );

    // Deploy contract (this would call the Midnight SDK)
    const contractAddress = getDeployedContractAddress() || `mn_contract_${Date.now().toString(16)}`;
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

    // Also persist to Supabase if configured
    const sb = getSupabase();
    if (sb) {
        await sb.from("escrows").insert(recordToRow(record));
    }

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
    _provider: MidnightProvider,
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

    // Sync to Supabase if configured
    const sb = getSupabase();
    if (sb) {
        await sb.from("escrows").update(recordToRow(updatedRecord)).eq("id", escrowId);
    }

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
    const local = escrowStore.get(escrowId);
    if (local) return local;

    // Try Supabase (sync fallback: return null if SB, caller should use async version)
    return null;
}

/**
 * Async version that queries Supabase directly.
 */
export async function getEscrowAsync(escrowId: string): Promise<EscrowRecord | null> {
    const local = escrowStore.get(escrowId);
    if (local) return local;

    const sb = getSupabase();
    if (sb) {
        const { data } = await sb.from("escrows").select("*").eq("id", escrowId).single();
        return data ? rowToRecord(data) : null;
    }
    return null;
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
 * Async version that queries Supabase directly.
 */
export async function listEscrowsAsync(filters?: {
    state?: EscrowState;
    buyerAddress?: string;
    sellerAddress?: string;
}): Promise<EscrowRecord[]> {
    const sb = getSupabase();
    if (sb) {
        let query = sb.from("escrows").select("*");
        if (filters?.state !== undefined) {
            query = query.eq("state", filters.state);
        }
        if (filters?.buyerAddress) {
            query = query.eq("buyer_address", filters.buyerAddress);
        }
        if (filters?.sellerAddress) {
            query = query.eq("seller_address", filters.sellerAddress);
        }
        const { data } = await query.order("created_at", { ascending: false });
        return (data || []).map(rowToRecord);
    }
    return listEscrows(filters);
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

    const sb = getSupabase();
    if (sb) {
        sb.from("escrows").delete().eq("id", escrowId);
    }

    return deleted;
}

/**
 * Clears all escrow data (for testing).
 */
export function clearAllEscrows(): void {
    escrowStore.clear();
    clearMemoryState();

    const sb = getSupabase();
    if (sb) {
        sb.from("escrows").delete().neq("id", "");
    }
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MidnightProvider {
    isConnected: boolean;
    address?: string;
    sign?: (data: string) => Promise<string>;
}
