import path from "node:path";
import type { EscrowState } from "./types";

// ─── Contract Bindings ─────────────────────────────────────────────────────────
// Loads compiled Compact artifacts and provides typed access to the
// escrow contract's circuits and ledger state.

const ARTIFACTS_DIR = path.resolve(
    import.meta.dirname ?? process.cwd(),
    "../../artifacts",
);

const CONTRACT_NAME = "haven";

export interface CompiledEscrowContract {
    contract: unknown;
    info: ContractInfo;
}

export interface ContractInfo {
    name: string;
    version: string;
    circuits: string[];
    ledgerFields: string[];
}

// ─── Artifact Loading ──────────────────────────────────────────────────────────

/**
 * Loads the compiled escrow contract artifacts.
 * Throws if artifacts are not found — run `npm run compile:escrow` first.
 */
export async function loadEscrowContract(): Promise<CompiledEscrowContract> {
    const contractPath = path.join(ARTIFACTS_DIR, `${CONTRACT_NAME}.compact`);
    const infoPath = path.join(ARTIFACTS_DIR, `${CONTRACT_NAME}.json`);

    let contract: unknown;
    let info: ContractInfo;

    try {
        contract = await import(contractPath);
    } catch {
        throw new Error(
            `Failed to load contract artifacts from ${contractPath}. ` +
                `Run "npm run compile:escrow" first.`,
        );
    }

    try {
        const infoModule = await import(infoPath);
        info = infoModule.default ?? infoModule;
    } catch {
        // Fallback: construct info from known contract structure
        info = {
            name: CONTRACT_NAME,
            version: "1.0.0",
            circuits: [
                "constructor",
                "deposit",
                "confirmDelivery",
                "release",
                "dispute",
                "resolve",
                "cancel",
            ],
            ledgerFields: [
                "buyerCommitment",
                "sellerCommitment",
                "amountCommitment",
                "conditionCommitment",
                "escrowState",
                "depositCount",
                "disputeCount",
            ],
        };
    }

    return { contract, info };
}

// ─── Circuit Names ─────────────────────────────────────────────────────────────

export const CIRCUITS = {
    CONSTRUCTOR: "constructor",
    DEPOSIT: "deposit",
    CONFIRM_DELIVERY: "confirmDelivery",
    RELEASE: "release",
    DISPUTE: "dispute",
    RESOLVE: "resolve",
    CANCEL: "cancel",
} as const;

export type CircuitName = (typeof CIRCUITS)[keyof typeof CIRCUITS];

// ─── Ledger Field Names ────────────────────────────────────────────────────────

export const LEDGER_FIELDS = {
    BUYER_COMMITMENT: "buyerCommitment",
    SELLER_COMMITMENT: "sellerCommitment",
    AMOUNT_COMMITMENT: "amountCommitment",
    CONDITION_COMMITMENT: "conditionCommitment",
    ESCROW_STATE: "escrowState",
    DEPOSIT_COUNT: "depositCount",
    DISPUTE_COUNT: "disputeCount",
} as const;

// ─── State Transition Map ──────────────────────────────────────────────────────
// Defines which circuits can be called in each state.

export const VALID_TRANSITIONS: Record<EscrowState, CircuitName[]> = {
    0: ["deposit", "cancel"],           // Created → Funded or Cancelled
    1: ["confirmDelivery", "dispute"],  // Funded → Delivered or Disputed
    2: ["release", "dispute"],          // Delivered → Released or Disputed
    3: [],                              // Released (terminal)
    4: ["resolve"],                     // Disputed → Resolved
    5: [],                              // Resolved (terminal)
    6: [],                              // Cancelled (terminal)
};

/**
 * Checks if a circuit can be called in the given state.
 */
export function isValidTransition(
    state: EscrowState,
    circuit: CircuitName,
): boolean {
    return VALID_TRANSITIONS[state]?.includes(circuit) ?? false;
}

/**
 * Returns the list of valid circuits for the given state.
 */
export function getValidCircuits(state: EscrowState): CircuitName[] {
    return VALID_TRANSITIONS[state] ?? [];
}
