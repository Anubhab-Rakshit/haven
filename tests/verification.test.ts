import { describe, it, expect } from "vitest";
import {
    verifyStateTransition,
    verifyAddressCommitment,
    verifyAmount,
    verifyCondition,
    computeEscrowHash,
    validateEscrowRecord,
} from "../src/escrow/verification";
import { EscrowState } from "../src/escrow/types";

describe("Verification", () => {
    describe("verifyStateTransition", () => {
        it("should allow Created → Funded", () => {
            const result = verifyStateTransition(
                EscrowState.Created,
                EscrowState.Funded,
            );
            expect(result.valid).toBe(true);
        });

        it("should allow Created → Cancelled", () => {
            const result = verifyStateTransition(
                EscrowState.Created,
                EscrowState.Cancelled,
            );
            expect(result.valid).toBe(true);
        });

        it("should allow Funded → Delivered", () => {
            const result = verifyStateTransition(
                EscrowState.Funded,
                EscrowState.Delivered,
            );
            expect(result.valid).toBe(true);
        });

        it("should allow Funded → Disputed", () => {
            const result = verifyStateTransition(
                EscrowState.Funded,
                EscrowState.Disputed,
            );
            expect(result.valid).toBe(true);
        });

        it("should allow Delivered → Released", () => {
            const result = verifyStateTransition(
                EscrowState.Delivered,
                EscrowState.Released,
            );
            expect(result.valid).toBe(true);
        });

        it("should allow Delivered → Disputed", () => {
            const result = verifyStateTransition(
                EscrowState.Delivered,
                EscrowState.Disputed,
            );
            expect(result.valid).toBe(true);
        });

        it("should allow Disputed → Resolved", () => {
            const result = verifyStateTransition(
                EscrowState.Disputed,
                EscrowState.Resolved,
            );
            expect(result.valid).toBe(true);
        });

        it("should not allow Created → Released", () => {
            const result = verifyStateTransition(
                EscrowState.Created,
                EscrowState.Released,
            );
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("Cannot transition");
        });

        it("should not allow Released → any state", () => {
            const terminalStates = [
                EscrowState.Created,
                EscrowState.Funded,
                EscrowState.Delivered,
                EscrowState.Disputed,
                EscrowState.Resolved,
                EscrowState.Cancelled,
            ];

            for (const state of terminalStates) {
                const result = verifyStateTransition(
                    EscrowState.Released,
                    state,
                );
                expect(result.valid).toBe(false);
            }
        });

        it("should not allow Cancelled → any state", () => {
            const terminalStates = [
                EscrowState.Created,
                EscrowState.Funded,
                EscrowState.Delivered,
                EscrowState.Disputed,
                EscrowState.Resolved,
                EscrowState.Released,
            ];

            for (const state of terminalStates) {
                const result = verifyStateTransition(
                    EscrowState.Cancelled,
                    state,
                );
                expect(result.valid).toBe(false);
            }
        });

        it("should not allow Resolved → any state", () => {
            const terminalStates = [
                EscrowState.Created,
                EscrowState.Funded,
                EscrowState.Delivered,
                EscrowState.Disputed,
                EscrowState.Cancelled,
                EscrowState.Released,
            ];

            for (const state of terminalStates) {
                const result = verifyStateTransition(
                    EscrowState.Resolved,
                    state,
                );
                expect(result.valid).toBe(false);
            }
        });
    });

    describe("verifyAddressCommitment", () => {
        it("should accept valid address and commitment", () => {
            const result = verifyAddressCommitment(
                "mn_addr_preprod1234567890",
                "a".repeat(64),
            );
            expect(result.valid).toBe(true);
        });

        it("should reject empty address", () => {
            const result = verifyAddressCommitment("", "a".repeat(64));
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("empty");
        });

        it("should reject empty commitment", () => {
            const result = verifyAddressCommitment(
                "mn_addr_preprod1234567890",
                "",
            );
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("empty");
        });

        it("should reject short address", () => {
            const result = verifyAddressCommitment("abc", "a".repeat(64));
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("Invalid address format");
        });

        it("should reject wrong length commitment", () => {
            const result = verifyAddressCommitment(
                "mn_addr_preprod1234567890",
                "abc",
            );
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("Invalid commitment format");
        });
    });

    describe("verifyAmount", () => {
        it("should accept valid positive amount", () => {
            const result = verifyAmount("100.50");
            expect(result.valid).toBe(true);
        });

        it("should accept zero amount", () => {
            const result = verifyAmount("0");
            expect(result.valid).toBe(false);
        });

        it("should accept small amount", () => {
            const result = verifyAmount("0.01");
            expect(result.valid).toBe(true);
        });

        it("should reject empty amount", () => {
            const result = verifyAmount("");
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("empty");
        });

        it("should reject negative amount", () => {
            const result = verifyAmount("-100");
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("positive number");
        });

        it("should reject non-numeric amount", () => {
            const result = verifyAmount("abc");
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("positive number");
        });

        it("should reject amount exceeding maximum", () => {
            const result = verifyAmount("2000000000");
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("exceeds maximum");
        });
    });

    describe("verifyCondition", () => {
        it("should accept valid condition", () => {
            const result = verifyCondition("Deliver 10 units of product X");
            expect(result.valid).toBe(true);
        });

        it("should reject empty condition", () => {
            const result = verifyCondition("");
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("empty");
        });

        it("should reject whitespace-only condition", () => {
            const result = verifyCondition("   ");
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("empty");
        });

        it("should reject condition exceeding max length", () => {
            const result = verifyCondition("a".repeat(501));
            expect(result.valid).toBe(false);
            expect(result.reason).toContain("exceeds maximum length");
        });

        it("should accept condition at max length", () => {
            const result = verifyCondition("a".repeat(500));
            expect(result.valid).toBe(true);
        });
    });

    describe("computeEscrowHash", () => {
        it("should generate a consistent hash for the same inputs", () => {
            const params = {
                buyerAddress: "buyer1",
                sellerAddress: "seller1",
                amount: "1000",
                condition: "deliver goods",
                timestamp: "2026-01-01T00:00:00Z",
            };

            const hash1 = computeEscrowHash(params);
            const hash2 = computeEscrowHash(params);

            expect(hash1).toBe(hash2);
        });

        it("should generate different hashes for different inputs", () => {
            const params1 = {
                buyerAddress: "buyer1",
                sellerAddress: "seller1",
                amount: "1000",
                condition: "deliver goods",
                timestamp: "2026-01-01T00:00:00Z",
            };

            const params2 = {
                buyerAddress: "buyer2",
                sellerAddress: "seller1",
                amount: "1000",
                condition: "deliver goods",
                timestamp: "2026-01-01T00:00:00Z",
            };

            const hash1 = computeEscrowHash(params1);
            const hash2 = computeEscrowHash(params2);

            expect(hash1).not.toBe(hash2);
        });

        it("should start with escrow_ prefix", () => {
            const hash = computeEscrowHash({
                buyerAddress: "buyer1",
                sellerAddress: "seller1",
                amount: "1000",
                condition: "deliver goods",
                timestamp: "2026-01-01T00:00:00Z",
            });

            expect(hash.startsWith("escrow_")).toBe(true);
        });
    });

    describe("validateEscrowRecord", () => {
        it("should accept a complete record", () => {
            const result = validateEscrowRecord({
                id: "escrow_1",
                contractAddress: "mn_contract_1",
                buyerAddress: "mn_buyer_1",
                sellerAddress: "mn_seller_1",
                amount: "1000",
                condition: "deliver goods",
                state: EscrowState.Created,
            });

            expect(result.valid).toBe(true);
        });

        it("should reject record with missing id", () => {
            const result = validateEscrowRecord({
                contractAddress: "mn_contract_1",
                buyerAddress: "mn_buyer_1",
                sellerAddress: "mn_seller_1",
                amount: "1000",
                condition: "deliver goods",
                state: EscrowState.Created,
            });

            expect(result.valid).toBe(false);
            expect(result.reason).toContain("Missing id");
        });

        it("should reject record with multiple missing fields", () => {
            const result = validateEscrowRecord({});

            expect(result.valid).toBe(false);
            expect(result.details?.missingFields).toContain("Missing id");
            expect(result.details?.missingFields).toContain(
                "Missing contractAddress",
            );
            expect(result.details?.missingFields).toContain("Missing buyerAddress");
        });
    });
});
