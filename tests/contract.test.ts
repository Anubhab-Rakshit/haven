import { describe, it, expect } from "vitest";
import {
    CIRCUITS,
    LEDGER_FIELDS,
    VALID_TRANSITIONS,
    isValidTransition,
    getValidCircuits,
} from "../src/escrow/contract";
import { EscrowState } from "../src/escrow/types";

describe("Contract", () => {
    describe("CIRCUITS", () => {
        it("should define all circuit names", () => {
            expect(CIRCUITS.CONSTRUCTOR).toBe("constructor");
            expect(CIRCUITS.DEPOSIT).toBe("deposit");
            expect(CIRCUITS.CONFIRM_DELIVERY).toBe("confirmDelivery");
            expect(CIRCUITS.RELEASE).toBe("release");
            expect(CIRCUITS.DISPUTE).toBe("dispute");
            expect(CIRCUITS.RESOLVE).toBe("resolve");
            expect(CIRCUITS.CANCEL).toBe("cancel");
        });
    });

    describe("LEDGER_FIELDS", () => {
        it("should define all ledger field names", () => {
            expect(LEDGER_FIELDS.BUYER_COMMITMENT).toBe("buyerCommitment");
            expect(LEDGER_FIELDS.SELLER_COMMITMENT).toBe("sellerCommitment");
            expect(LEDGER_FIELDS.AMOUNT_COMMITMENT).toBe("amountCommitment");
            expect(LEDGER_FIELDS.CONDITION_COMMITMENT).toBe(
                "conditionCommitment",
            );
            expect(LEDGER_FIELDS.ESCROW_STATE).toBe("escrowState");
            expect(LEDGER_FIELDS.DEPOSIT_COUNT).toBe("depositCount");
            expect(LEDGER_FIELDS.DISPUTE_COUNT).toBe("disputeCount");
        });
    });

    describe("VALID_TRANSITIONS", () => {
        it("should define valid transitions for Created state", () => {
            expect(VALID_TRANSITIONS[EscrowState.Created]).toContain("deposit");
            expect(VALID_TRANSITIONS[EscrowState.Created]).toContain("cancel");
        });

        it("should define valid transitions for Funded state", () => {
            expect(VALID_TRANSITIONS[EscrowState.Funded]).toContain(
                "confirmDelivery",
            );
            expect(VALID_TRANSITIONS[EscrowState.Funded]).toContain("dispute");
        });

        it("should define valid transitions for Delivered state", () => {
            expect(VALID_TRANSITIONS[EscrowState.Delivered]).toContain(
                "release",
            );
            expect(VALID_TRANSITIONS[EscrowState.Delivered]).toContain(
                "dispute",
            );
        });

        it("should define no transitions for Released state", () => {
            expect(VALID_TRANSITIONS[EscrowState.Released]).toHaveLength(0);
        });

        it("should define valid transitions for Disputed state", () => {
            expect(VALID_TRANSITIONS[EscrowState.Disputed]).toContain(
                "resolve",
            );
        });

        it("should define no transitions for Resolved state", () => {
            expect(VALID_TRANSITIONS[EscrowState.Resolved]).toHaveLength(0);
        });

        it("should define no transitions for Cancelled state", () => {
            expect(VALID_TRANSITIONS[EscrowState.Cancelled]).toHaveLength(0);
        });
    });

    describe("isValidTransition", () => {
        it("should return true for valid transitions", () => {
            expect(
                isValidTransition(EscrowState.Created, "deposit"),
            ).toBe(true);
            expect(
                isValidTransition(EscrowState.Created, "cancel"),
            ).toBe(true);
            expect(
                isValidTransition(EscrowState.Funded, "confirmDelivery"),
            ).toBe(true);
            expect(
                isValidTransition(EscrowState.Funded, "dispute"),
            ).toBe(true);
            expect(
                isValidTransition(EscrowState.Delivered, "release"),
            ).toBe(true);
            expect(
                isValidTransition(EscrowState.Disputed, "resolve"),
            ).toBe(true);
        });

        it("should return false for invalid transitions", () => {
            expect(
                isValidTransition(EscrowState.Created, "release"),
            ).toBe(false);
            expect(
                isValidTransition(EscrowState.Created, "confirmDelivery"),
            ).toBe(false);
            expect(
                isValidTransition(EscrowState.Released, "deposit"),
            ).toBe(false);
            expect(
                isValidTransition(EscrowState.Resolved, "dispute"),
            ).toBe(false);
            expect(
                isValidTransition(EscrowState.Cancelled, "deposit"),
            ).toBe(false);
        });
    });

    describe("getValidCircuits", () => {
        it("should return valid circuits for Created state", () => {
            const circuits = getValidCircuits(EscrowState.Created);
            expect(circuits).toContain("deposit");
            expect(circuits).toContain("cancel");
            expect(circuits).not.toContain("release");
        });

        it("should return valid circuits for Funded state", () => {
            const circuits = getValidCircuits(EscrowState.Funded);
            expect(circuits).toContain("confirmDelivery");
            expect(circuits).toContain("dispute");
            expect(circuits).not.toContain("deposit");
        });

        it("should return empty array for terminal states", () => {
            expect(getValidCircuits(EscrowState.Released)).toHaveLength(0);
            expect(getValidCircuits(EscrowState.Resolved)).toHaveLength(0);
            expect(getValidCircuits(EscrowState.Cancelled)).toHaveLength(0);
        });
    });
});
