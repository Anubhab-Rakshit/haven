import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    serializePrivateState,
    deserializePrivateState,
    savePrivateStateMemory,
    loadPrivateStateMemory,
    removePrivateStateMemory,
    clearMemoryState,
    createInitialPrivateState,
    updatePrivateState,
} from "../src/escrow/private-state";
import { EscrowState } from "../src/escrow/types";

describe("Private State", () => {
    beforeEach(() => {
        clearMemoryState();
    });

    afterEach(() => {
        clearMemoryState();
    });

    describe("createInitialPrivateState", () => {
        it("should create a valid initial state", () => {
            const state = createInitialPrivateState({
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "1000",
                condition: "deliver goods",
                salt: "c".repeat(64),
                contractAddress: "mn_contract_123",
                buyerAddress: "mn_buyer_123",
                sellerAddress: "mn_seller_123",
            });

            expect(state.buyerSecret).toBe("a".repeat(64));
            expect(state.sellerSecret).toBe("b".repeat(64));
            expect(state.amount).toBe("1000");
            expect(state.condition).toBe("deliver goods");
            expect(state.salt).toBe("c".repeat(64));
            expect(state.contractAddress).toBe("mn_contract_123");
            expect(state.buyerAddress).toBe("mn_buyer_123");
            expect(state.sellerAddress).toBe("mn_seller_123");
            expect(state.state).toBe(EscrowState.Created);
            expect(state.createdAt).toBeDefined();
        });
    });

    describe("updatePrivateState", () => {
        it("should update the state and preserve other fields", () => {
            const initial = createInitialPrivateState({
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "1000",
                condition: "deliver goods",
                salt: "c".repeat(64),
                contractAddress: "mn_contract_123",
                buyerAddress: "mn_buyer_123",
                sellerAddress: "mn_seller_123",
            });

            const updated = updatePrivateState(initial, EscrowState.Funded);

            expect(updated.state).toBe(EscrowState.Funded);
            expect(updated.buyerSecret).toBe(initial.buyerSecret);
            expect(updated.sellerSecret).toBe(initial.sellerSecret);
            expect(updated.amount).toBe(initial.amount);
            expect(updated.contractAddress).toBe(initial.contractAddress);
        });

        it("should not mutate the original state", () => {
            const initial = createInitialPrivateState({
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "1000",
                condition: "deliver goods",
                salt: "c".repeat(64),
                contractAddress: "mn_contract_123",
                buyerAddress: "mn_buyer_123",
                sellerAddress: "mn_seller_123",
            });

            const updated = updatePrivateState(initial, EscrowState.Funded);

            expect(initial.state).toBe(EscrowState.Created);
            expect(updated.state).toBe(EscrowState.Funded);
        });
    });

    describe("Serialization", () => {
        it("should serialize and deserialize private state", () => {
            const state = createInitialPrivateState({
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "1000",
                condition: "deliver goods",
                salt: "c".repeat(64),
                contractAddress: "mn_contract_123",
                buyerAddress: "mn_buyer_123",
                sellerAddress: "mn_seller_123",
            });

            const serialized = serializePrivateState(state);
            const deserialized = deserializePrivateState(serialized);

            expect(deserialized).toEqual(state);
        });

        it("should throw on invalid JSON", () => {
            expect(() => deserializePrivateState("invalid")).toThrow();
        });

        it("should throw on missing required fields", () => {
            expect(() =>
                deserializePrivateState(JSON.stringify({ buyerSecret: "a" })),
            ).toThrow("Invalid private state: missing required fields");
        });
    });

    describe("Memory Storage", () => {
        it("should save and load private state", () => {
            const state = createInitialPrivateState({
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "1000",
                condition: "deliver goods",
                salt: "c".repeat(64),
                contractAddress: "mn_contract_123",
                buyerAddress: "mn_buyer_123",
                sellerAddress: "mn_seller_123",
            });

            savePrivateStateMemory("escrow_1", state);
            const loaded = loadPrivateStateMemory("escrow_1");

            expect(loaded).toEqual(state);
        });

        it("should return null for non-existent escrow", () => {
            const loaded = loadPrivateStateMemory("nonexistent");
            expect(loaded).toBeNull();
        });

        it("should remove private state", () => {
            const state = createInitialPrivateState({
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "1000",
                condition: "deliver goods",
                salt: "c".repeat(64),
                contractAddress: "mn_contract_123",
                buyerAddress: "mn_buyer_123",
                sellerAddress: "mn_seller_123",
            });

            savePrivateStateMemory("escrow_1", state);
            removePrivateStateMemory("escrow_1");
            const loaded = loadPrivateStateMemory("escrow_1");

            expect(loaded).toBeNull();
        });

        it("should clear all memory state", () => {
            const state1 = createInitialPrivateState({
                buyerSecret: "a".repeat(64),
                sellerSecret: "b".repeat(64),
                amount: "1000",
                condition: "deliver goods",
                salt: "c".repeat(64),
                contractAddress: "mn_contract_1",
                buyerAddress: "mn_buyer_1",
                sellerAddress: "mn_seller_1",
            });

            const state2 = createInitialPrivateState({
                buyerSecret: "d".repeat(64),
                sellerSecret: "e".repeat(64),
                amount: "2000",
                condition: "deliver services",
                salt: "f".repeat(64),
                contractAddress: "mn_contract_2",
                buyerAddress: "mn_buyer_2",
                sellerAddress: "mn_seller_2",
            });

            savePrivateStateMemory("escrow_1", state1);
            savePrivateStateMemory("escrow_2", state2);

            clearMemoryState();

            expect(loadPrivateStateMemory("escrow_1")).toBeNull();
            expect(loadPrivateStateMemory("escrow_2")).toBeNull();
        });
    });
});
