import type { EscrowState, VerificationResult } from "./types";
import { ESCROW_STATE_LABELS, EscrowState as State } from "./types";

// ─── Verification Utilities ────────────────────────────────────────────────────
// Functions for verifying escrow state, proofs, and conditions.

/**
 * Verifies that a state transition is valid.
 */
export function verifyStateTransition(
    currentState: EscrowState,
    targetState: EscrowState,
): VerificationResult {
    const validTransitions: Record<EscrowState, EscrowState[]> = {
        [State.Created]: [State.Funded, State.Cancelled],
        [State.Funded]: [State.Delivered, State.Disputed],
        [State.Delivered]: [State.Released, State.Disputed],
        [State.Released]: [],
        [State.Disputed]: [State.Resolved],
        [State.Resolved]: [],
        [State.Cancelled]: [],
    };

    const valid = validTransitions[currentState]?.includes(targetState) ?? false;

    if (!valid) {
        return {
            valid: false,
            reason: `Cannot transition from ${ESCROW_STATE_LABELS[currentState]} to ${ESCROW_STATE_LABELS[targetState]}`,
            details: {
                currentState,
                targetState,
                validTargets: validTransitions[currentState] ?? [],
            },
        };
    }

    return { valid: true };
}

/**
 * Verifies that an address matches a commitment.
 * In a real implementation, this would recompute the commitment from
 * the address and compare it to the on-chain commitment.
 */
export function verifyAddressCommitment(
    address: string,
    commitment: string,
): VerificationResult {
    if (!address || !commitment) {
        return {
            valid: false,
            reason: "Address or commitment is empty",
        };
    }

    // Basic format validation
    if (address.length < 10) {
        return {
            valid: false,
            reason: "Invalid address format",
        };
    }

    if (commitment.length !== 64) {
        return {
            valid: false,
            reason: "Invalid commitment format (expected 64 hex characters)",
        };
    }

    return { valid: true };
}

/**
 * Verifies that an escrow amount is valid.
 */
export function verifyAmount(amount: string): VerificationResult {
    if (!amount) {
        return {
            valid: false,
            reason: "Amount is empty",
        };
    }

    const num = Number.parseFloat(amount);
    if (Number.isNaN(num) || num <= 0) {
        return {
            valid: false,
            reason: "Amount must be a positive number",
            details: { amount, parsed: num },
        };
    }

    if (num > 1_000_000_000) {
        return {
            valid: false,
            reason: "Amount exceeds maximum allowed value",
            details: { amount, max: "1,000,000,000" },
        };
    }

    return { valid: true };
}

/**
 * Verifies that a condition string is valid.
 */
export function verifyCondition(condition: string): VerificationResult {
    if (!condition || condition.trim().length === 0) {
        return {
            valid: false,
            reason: "Condition cannot be empty",
        };
    }

    if (condition.length > 500) {
        return {
            valid: false,
            reason: "Condition exceeds maximum length (500 characters)",
            details: { length: condition.length, max: 500 },
        };
    }

    return { valid: true };
}

/**
 * Computes a simple hash of an escrow's public parameters.
 * Used for generating unique escrow IDs.
 */
export function computeEscrowHash(params: {
    buyerAddress: string;
    sellerAddress: string;
    amount: string;
    condition: string;
    timestamp: string;
}): string {
    const data = [
        params.buyerAddress,
        params.sellerAddress,
        params.amount,
        params.condition,
        params.timestamp,
    ].join(":");

    // Simple hash for ID generation (not cryptographic)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32-bit integer
    }

    return `escrow_${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

/**
 * Validates an escrow record for completeness.
 */
export function validateEscrowRecord(record: {
    id?: string;
    contractAddress?: string;
    buyerAddress?: string;
    sellerAddress?: string;
    amount?: string;
    condition?: string;
    state?: number;
}): VerificationResult {
    const errors: string[] = [];

    if (!record.id) errors.push("Missing id");
    if (!record.contractAddress) errors.push("Missing contractAddress");
    if (!record.buyerAddress) errors.push("Missing buyerAddress");
    if (!record.sellerAddress) errors.push("Missing sellerAddress");
    if (!record.amount) errors.push("Missing amount");
    if (!record.condition) errors.push("Missing condition");
    if (record.state === undefined || record.state === null)
        errors.push("Missing state");

    if (errors.length > 0) {
        return {
            valid: false,
            reason: errors.join("; "),
            details: { missingFields: errors },
        };
    }

    return { valid: true };
}
