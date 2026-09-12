import type { EscrowRecord, EscrowState } from "./types";

// ─── Private State Schema ──────────────────────────────────────────────────────
// Manages the private state of escrows — the sensitive data that never
// touches the blockchain. This includes secrets, amounts, and conditions.

const STORAGE_PREFIX = "midnight-lock:escrow:";

export interface PrivateEscrowState {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
    salt: string;
    contractAddress: string;
    buyerAddress: string;
    sellerAddress: string;
    state: EscrowState;
    createdAt: string;
}

// ─── Serialization ─────────────────────────────────────────────────────────────

/**
 * Serializes a private escrow state to a JSON string.
 */
export function serializePrivateState(state: PrivateEscrowState): string {
    return JSON.stringify(state);
}

/**
 * Deserializes a private escrow state from a JSON string.
 */
export function deserializePrivateState(data: string): PrivateEscrowState {
    const parsed = JSON.parse(data) as PrivateEscrowState;

    // Validate required fields
    if (
        !parsed.buyerSecret ||
        !parsed.sellerSecret ||
        !parsed.amount ||
        !parsed.condition ||
        !parsed.salt ||
        !parsed.contractAddress
    ) {
        throw new Error("Invalid private state: missing required fields");
    }

    return parsed;
}

// ─── LocalStorage Persistence ──────────────────────────────────────────────────
// Used for browser-based persistence. In production, this would be
// replaced with a more secure storage mechanism (e.g., encrypted IndexedDB).

/**
 * Saves a private escrow state to localStorage.
 */
export function savePrivateState(
    escrowId: string,
    state: PrivateEscrowState,
): void {
    if (typeof window === "undefined" || !window.localStorage) {
        throw new Error("localStorage not available");
    }
    const key = `${STORAGE_PREFIX}${escrowId}`;
    window.localStorage.setItem(key, serializePrivateState(state));
}

/**
 * Loads a private escrow state from localStorage.
 */
export function loadPrivateState(
    escrowId: string,
): PrivateEscrowState | null {
    if (typeof window === "undefined" || !window.localStorage) {
        return null;
    }
    const key = `${STORAGE_PREFIX}${escrowId}`;
    const data = window.localStorage.getItem(key);
    if (!data) return null;
    return deserializePrivateState(data);
}

/**
 * Removes a private escrow state from localStorage.
 */
export function removePrivateState(escrowId: string): void {
    if (typeof window === "undefined" || !window.localStorage) {
        return;
    }
    const key = `${STORAGE_PREFIX}${escrowId}`;
    window.localStorage.removeItem(key);
}

/**
 * Lists all escrow IDs stored in localStorage.
 */
export function listPrivateStateIds(): string[] {
    if (typeof window === "undefined" || !window.localStorage) {
        return [];
    }
    const ids: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key?.startsWith(STORAGE_PREFIX)) {
            ids.push(key.slice(STORAGE_PREFIX.length));
        }
    }
    return ids;
}

// ─── In-Memory State Provider ──────────────────────────────────────────────────
// For Node.js / testing environments where localStorage is not available.

const memoryStore = new Map<string, PrivateEscrowState>();

/**
 * Saves a private escrow state to memory (for testing/Node.js).
 */
export function savePrivateStateMemory(
    escrowId: string,
    state: PrivateEscrowState,
): void {
    memoryStore.set(escrowId, state);
}

/**
 * Loads a private escrow state from memory (for testing/Node.js).
 */
export function loadPrivateStateMemory(
    escrowId: string,
): PrivateEscrowState | null {
    return memoryStore.get(escrowId) ?? null;
}

/**
 * Removes a private escrow state from memory (for testing/Node.js).
 */
export function removePrivateStateMemory(escrowId: string): void {
    memoryStore.delete(escrowId);
}

/**
 * Clears all in-memory state (for testing).
 */
export function clearMemoryState(): void {
    memoryStore.clear();
}

// ─── State Construction ────────────────────────────────────────────────────────

/**
 * Creates an initial private state for a new escrow.
 */
export function createInitialPrivateState(params: {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
    salt: string;
    contractAddress: string;
    buyerAddress: string;
    sellerAddress: string;
}): PrivateEscrowState {
    return {
        buyerSecret: params.buyerSecret,
        sellerSecret: params.sellerSecret,
        amount: params.amount,
        condition: params.condition,
        salt: params.salt,
        contractAddress: params.contractAddress,
        buyerAddress: params.buyerAddress,
        sellerAddress: params.sellerAddress,
        state: 0, // Created
        createdAt: new Date().toISOString(),
    };
}

/**
 * Updates the state of a private escrow state record.
 */
export function updatePrivateState(
    state: PrivateEscrowState,
    newState: EscrowState,
): PrivateEscrowState {
    return {
        ...state,
        state: newState,
    };
}
