import { describe, it, expect, beforeEach } from "vitest";
import {
    createEscrowWitnesses,
    createWitnessesFromRecord,
    generateSecret,
    generateSalt,
} from "../src/escrow/witnesses";

describe("Witnesses", () => {
    describe("createEscrowWitnesses", () => {
        it("should create witness providers for all four parameters", () => {
            const buyerSecret = "a".repeat(64);
            const sellerSecret = "b".repeat(64);
            const amount = "0000000000000000000000000000000000000000000000000000000000001000";
            const condition = "c".repeat(64);

            const witnesses = createEscrowWitnesses(
                buyerSecret,
                sellerSecret,
                amount,
                condition,
            );

            expect(witnesses).toHaveProperty("buyerSecret");
            expect(witnesses).toHaveProperty("sellerSecret");
            expect(witnesses).toHaveProperty("escrowAmount");
            expect(witnesses).toHaveProperty("conditionHash");
            expect(typeof witnesses.buyerSecret).toBe("function");
            expect(typeof witnesses.sellerSecret).toBe("function");
            expect(typeof witnesses.escrowAmount).toBe("function");
            expect(typeof witnesses.conditionHash).toBe("function");
        });

        it("should return normalized 32-byte hex strings", () => {
            const buyerSecret = "a".repeat(64);
            const sellerSecret = "b".repeat(64);
            const amount = "c".repeat(64);
            const condition = "d".repeat(64);

            const witnesses = createEscrowWitnesses(
                buyerSecret,
                sellerSecret,
                amount,
                condition,
            );

            expect(witnesses.buyerSecret()).toBe(buyerSecret);
            expect(witnesses.sellerSecret()).toBe(sellerSecret);
            expect(witnesses.escrowAmount()).toBe(amount);
            expect(witnesses.conditionHash()).toBe(condition);
        });

        it("should pad short values to 32 bytes", () => {
            const witnesses = createEscrowWitnesses(
                "aabb",
                "ccdd",
                "1122",
                "3344",
            );

            const buyerResult = witnesses.buyerSecret();
            expect(buyerResult.length).toBe(64);
            expect(buyerResult.startsWith("aabb")).toBe(true);

            const sellerResult = witnesses.sellerSecret();
            expect(sellerResult.length).toBe(64);
            expect(sellerResult.startsWith("ccdd")).toBe(true);
        });

        it("should truncate long values to 32 bytes", () => {
            const longSecret = "a".repeat(100);
            const witnesses = createEscrowWitnesses(
                longSecret,
                "bb",
                "cc",
                "dd",
            );

            const result = witnesses.buyerSecret();
            expect(result.length).toBe(64);
            expect(result).toBe("a".repeat(64));
        });
    });

    describe("createWitnessesFromRecord", () => {
        it("should create witnesses from an escrow record", () => {
            const record = {
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "c".repeat(64),
                condition: "d".repeat(64),
            };

            const witnesses = createWitnessesFromRecord(record);

            expect(witnesses.buyerSecret()).toBe(record.buyerSecret);
            expect(witnesses.sellerSecret()).toBe(record.sellerSecret);
            expect(witnesses.escrowAmount()).toBe(record.amount);
            expect(witnesses.conditionHash()).toBe(record.condition);
        });
    });

    describe("generateSecret", () => {
        it("should generate a 64-character hex string", () => {
            const secret = generateSecret();
            expect(secret.length).toBe(64);
            expect(/^[0-9a-f]{64}$/.test(secret)).toBe(true);
        });

        it("should generate unique secrets", () => {
            const secret1 = generateSecret();
            const secret2 = generateSecret();
            expect(secret1).not.toBe(secret2);
        });
    });

    describe("generateSalt", () => {
        it("should generate a 64-character hex string", () => {
            const salt = generateSalt();
            expect(salt.length).toBe(64);
            expect(/^[0-9a-f]{64}$/.test(salt)).toBe(true);
        });

        it("should generate unique salts", () => {
            const salt1 = generateSalt();
            const salt2 = generateSalt();
            expect(salt1).not.toBe(salt2);
        });
    });
});
