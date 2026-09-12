import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
    deployEscrow,
    depositFunds,
    confirmDelivery,
    releaseFunds,
    raiseDispute,
    resolveDispute,
    cancelEscrow,
    getEscrow,
    listEscrows,
    clearAllEscrows,
} from "../src/escrow/service";
import { EscrowState } from "../src/escrow/types";
import { generateSecret } from "../src/escrow/witnesses";

// Mock provider for testing
const mockProvider = {
    isConnected: true,
    address: "mn_addr_preprod1234567890",
};

describe("Service", () => {
    beforeEach(() => {
        clearAllEscrows();
    });

    afterEach(() => {
        clearAllEscrows();
    });

    describe("deployEscrow", () => {
        it("should deploy a new escrow successfully", async () => {
            const result = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver 10 units of product X",
                },
                mockProvider as any,
            );

            expect(result.escrowId).toBeDefined();
            expect(result.contractAddress).toBeDefined();
            expect(result.transactionHash).toBeDefined();
            expect(result.buyerCommitment).toBeDefined();
            expect(result.sellerCommitment).toBeDefined();
            expect(result.amountCommitment).toBeDefined();
            expect(result.conditionCommitment).toBeDefined();
        });

        it("should create an escrow record in the store", async () => {
            const result = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver 10 units of product X",
                },
                mockProvider as any,
            );

            const record = getEscrow(result.escrowId);
            expect(record).not.toBeNull();
            expect(record?.state).toBe(EscrowState.Created);
            expect(record?.buyerAddress).toBe("mn_buyer_1");
            expect(record?.sellerAddress).toBe("mn_seller_1");
            expect(record?.amount).toBe("1000");
            expect(record?.condition).toBe("Deliver 10 units of product X");
        });

        it("should generate unique buyer and seller secrets", async () => {
            const result = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver 10 units",
                },
                mockProvider as any,
            );

            const record = getEscrow(result.escrowId);
            expect(record?.buyerSecret).toBeDefined();
            expect(record?.sellerSecret).toBeDefined();
            expect(record?.buyerSecret).not.toBe(record?.sellerSecret);
            expect(record?.buyerSecret?.length).toBe(64);
            expect(record?.sellerSecret?.length).toBe(64);
        });

        it("should reject invalid amount", async () => {
            await expect(
                deployEscrow(
                    {
                        buyerAddress: "mn_buyer_1",
                        sellerAddress: "mn_seller_1",
                        amount: "-100",
                        condition: "Deliver goods",
                    },
                    mockProvider as any,
                ),
            ).rejects.toThrow("Invalid amount");
        });

        it("should reject empty condition", async () => {
            await expect(
                deployEscrow(
                    {
                        buyerAddress: "mn_buyer_1",
                        sellerAddress: "mn_seller_1",
                        amount: "1000",
                        condition: "",
                    },
                    mockProvider as any,
                ),
            ).rejects.toThrow("Invalid condition");
        });
    });

    describe("depositFunds", () => {
        it("should deposit funds successfully", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);
            const result = await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Funded);
            expect(result.transactionHash).toBeDefined();

            const updatedRecord = getEscrow(deployResult.escrowId);
            expect(updatedRecord?.state).toBe(EscrowState.Funded);
            expect(updatedRecord?.fundedAt).toBeDefined();
        });

        it("should reject deposit from non-buyer", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const result = await depositFunds(
                deployResult.escrowId,
                "invalid_secret",
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Invalid secret");
        });

        it("should reject deposit for non-existent escrow", async () => {
            const result = await depositFunds(
                "nonexistent",
                generateSecret(),
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("not found");
        });
    });

    describe("confirmDelivery", () => {
        it("should confirm delivery successfully", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            // Deposit first
            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            // Confirm delivery
            const result = await confirmDelivery(
                deployResult.escrowId,
                record!.sellerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Delivered);

            const updatedRecord = getEscrow(deployResult.escrowId);
            expect(updatedRecord?.state).toBe(EscrowState.Delivered);
            expect(updatedRecord?.deliveredAt).toBeDefined();
        });

        it("should reject confirmation from non-seller", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            const result = await confirmDelivery(
                deployResult.escrowId,
                record!.buyerSecret, // Wrong party
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Only the seller");
        });

        it("should reject confirmation in wrong state", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            // Try to confirm without depositing
            const result = await confirmDelivery(
                deployResult.escrowId,
                record!.sellerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Cannot perform confirmDelivery");
        });
    });

    describe("releaseFunds", () => {
        it("should release funds successfully", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            await confirmDelivery(
                deployResult.escrowId,
                record!.sellerSecret,
                mockProvider as any,
            );

            const result = await releaseFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Released);

            const updatedRecord = getEscrow(deployResult.escrowId);
            expect(updatedRecord?.state).toBe(EscrowState.Released);
            expect(updatedRecord?.releasedAt).toBeDefined();
        });

        it("should reject release in wrong state", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            // Try to release without confirming delivery
            const result = await releaseFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Cannot perform release");
        });
    });

    describe("raiseDispute", () => {
        it("should raise dispute from funded state", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            const result = await raiseDispute(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Disputed);

            const updatedRecord = getEscrow(deployResult.escrowId);
            expect(updatedRecord?.state).toBe(EscrowState.Disputed);
            expect(updatedRecord?.disputedAt).toBeDefined();
        });

        it("should raise dispute from delivered state", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            await confirmDelivery(
                deployResult.escrowId,
                record!.sellerSecret,
                mockProvider as any,
            );

            const result = await raiseDispute(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Disputed);
        });

        it("should reject dispute in created state", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            const result = await raiseDispute(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Cannot perform dispute");
        });
    });

    describe("resolveDispute", () => {
        it("should resolve dispute successfully", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            await raiseDispute(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            const result = await resolveDispute(
                deployResult.escrowId,
                record!.sellerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Resolved);

            const updatedRecord = getEscrow(deployResult.escrowId);
            expect(updatedRecord?.state).toBe(EscrowState.Resolved);
            expect(updatedRecord?.resolvedAt).toBeDefined();
        });

        it("should reject resolution from non-seller", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            await raiseDispute(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            const result = await resolveDispute(
                deployResult.escrowId,
                record!.buyerSecret, // Wrong party
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Only the seller");
        });
    });

    describe("cancelEscrow", () => {
        it("should cancel escrow successfully", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            const result = await cancelEscrow(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(true);
            expect(result.newState).toBe(EscrowState.Cancelled);

            const updatedRecord = getEscrow(deployResult.escrowId);
            expect(updatedRecord?.state).toBe(EscrowState.Cancelled);
            expect(updatedRecord?.cancelledAt).toBeDefined();
        });

        it("should reject cancellation after deposit", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);

            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            const result = await cancelEscrow(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            expect(result.success).toBe(false);
            expect(result.error).toContain("Cannot perform cancel");
        });
    });

    describe("listEscrows", () => {
        it("should list all escrows", async () => {
            await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            await deployEscrow(
                {
                    buyerAddress: "mn_buyer_2",
                    sellerAddress: "mn_seller_2",
                    amount: "2000",
                    condition: "Deliver services",
                },
                mockProvider as any,
            );

            const escrows = listEscrows();
            expect(escrows.length).toBe(2);
        });

        it("should filter by state", async () => {
            const deployResult = await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            await deployEscrow(
                {
                    buyerAddress: "mn_buyer_2",
                    sellerAddress: "mn_seller_2",
                    amount: "2000",
                    condition: "Deliver services",
                },
                mockProvider as any,
            );

            const record = getEscrow(deployResult.escrowId);
            await depositFunds(
                deployResult.escrowId,
                record!.buyerSecret,
                mockProvider as any,
            );

            const fundedEscrows = listEscrows({
                state: EscrowState.Funded,
            });
            expect(fundedEscrows.length).toBe(1);
            expect(fundedEscrows[0].state).toBe(EscrowState.Funded);

            const createdEscrows = listEscrows({
                state: EscrowState.Created,
            });
            expect(createdEscrows.length).toBe(1);
            expect(createdEscrows[0].state).toBe(EscrowState.Created);
        });

        it("should filter by buyer address", async () => {
            await deployEscrow(
                {
                    buyerAddress: "mn_buyer_1",
                    sellerAddress: "mn_seller_1",
                    amount: "1000",
                    condition: "Deliver goods",
                },
                mockProvider as any,
            );

            await deployEscrow(
                {
                    buyerAddress: "mn_buyer_2",
                    sellerAddress: "mn_seller_2",
                    amount: "2000",
                    condition: "Deliver services",
                },
                mockProvider as any,
            );

            const buyer1Escrows = listEscrows({
                buyerAddress: "mn_buyer_1",
            });
            expect(buyer1Escrows.length).toBe(1);
            expect(buyer1Escrows[0].buyerAddress).toBe("mn_buyer_1");
        });
    });
});
