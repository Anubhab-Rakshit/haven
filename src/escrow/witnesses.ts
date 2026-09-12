import type { EscrowWitnesses } from "./types";

// ─── Witness Providers ─────────────────────────────────────────────────────────
// These functions bridge private state (stored locally) to the ZK circuit.
// They are called during proof generation and never expose the actual values.

/**
 * Creates witness providers for the escrow contract.
 *
 * Each witness function returns the private value that the ZK circuit
 * needs to generate a proof. The circuit uses these to compute commitments
 * and verify authorization without revealing the underlying data.
 *
 * @param buyerSecret - The buyer's private secret (32 bytes, hex-encoded)
 * @param sellerSecret - The seller's private secret (32 bytes, hex-encoded)
 * @param amount - The escrow amount (encoded as 32-byte hex string)
 * @param condition - The condition hash (32 bytes, hex-encoded)
 * @returns Witness provider functions for the ZK circuit
 */
export function createEscrowWitnesses(
    buyerSecret: string,
    sellerSecret: string,
    amount: string,
    condition: string,
): EscrowWitnesses {
    // Pad/truncate to exactly 32 bytes (64 hex characters)
    const normalize = (value: string): string => {
        const bytes = hexToBytes(value);
        const padded = new Uint8Array(32);
        padded.set(bytes.slice(0, 32));
        return bytesToHex(padded);
    };

    return {
        buyerSecret: () => normalize(buyerSecret),
        sellerSecret: () => normalize(sellerSecret),
        escrowAmount: () => normalize(amount),
        conditionHash: () => normalize(condition),
    };
}

/**
 * Creates witness providers from an escrow record.
 * Convenience function that extracts secrets from a stored escrow.
 */
export function createWitnessesFromRecord(record: {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
}): EscrowWitnesses {
    return createEscrowWitnesses(
        record.buyerSecret,
        record.sellerSecret,
        record.amount,
        record.condition,
    );
}

// ─── Hex Utilities ─────────────────────────────────────────────────────────────

function hexToBytes(hex: string): Uint8Array {
    const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
    const bytes = new Uint8Array(clean.length / 2);
    for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = Number.parseInt(clean.substring(i, i + 2), 16);
    }
    return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// ─── Secret Generation ─────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure random secret.
 * Returns a 32-byte hex string suitable for use as a buyer or seller secret.
 */
export function generateSecret(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return bytesToHex(bytes);
}

/**
 * Generates a random salt for escrow commitment.
 * Returns a 32-byte hex string.
 */
export function generateSalt(): string {
    return generateSecret();
}
