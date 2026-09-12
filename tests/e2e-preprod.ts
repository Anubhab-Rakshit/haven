/**
 * E2E Integration Test — Haven Escrow on Preprod
 *
 * Tests the full escrow lifecycle against the deployed contract on Midnight preprod.
 * Requires: docker compose up -d (proof server) and a funded wallet.
 *
 * Usage:
 *   npx tsx tests/e2e-preprod.ts
 */

import { getDeployedContractAddress, loadState, NETWORK_CONFIGS } from '../src/network';
import { restoreOrCreateWallet, type WalletContext } from '../src/wallet';
import {
    deployEscrow,
    depositFunds,
    cancelEscrow,
    getEscrow,
    listEscrows,
    clearAllEscrows,
} from '../src/escrow/service';

const NETWORK = 'preprod';

async function waitForProofServer(url: string, timeoutMs = 30_000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        try {
            const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
            if (res.ok) return true;
        } catch {
            // ignore
        }
        await new Promise((r) => setTimeout(r, 1000));
    }
    return false;
}

async function main() {
    console.log(' Haven E2E Integration Test — Preprod\n');

    // ── Step 1: Load deployment info ────────────────────────────────────────
    const contractAddress = getDeployedContractAddress(NETWORK);
    if (!contractAddress) {
        console.error('No deployed contract found. Run `npm run deploy:escrow -- --network preprod` first.');
        process.exit(1);
    }
    console.log(` Contract Address: ${contractAddress}`);

    const state = loadState();
    if (!state?.wallets?.[NETWORK]) {
        console.error('No wallet found. Run `npm run deploy:escrow -- --network preprod` first.');
        process.exit(1);
    }
    console.log(' Wallet loaded from .midnight-state.json');

    // ── Step 2: Check proof server ──────────────────────────────────────────
    const proofServerUrl = NETWORK_CONFIGS[NETWORK].proofServer;
    console.log(`\n Checking proof server at ${proofServerUrl}...`);

    const serverReady = await waitForProofServer(proofServerUrl);
    if (!serverReady) {
        console.error(`Proof server not reachable at ${proofServerUrl}`);
        console.error('Run `docker compose up -d` to start it.');
        process.exit(1);
    }
    console.log(' Proof server is ready');

    // ── Step 3: Create wallet ───────────────────────────────────────────────
    console.log('\n Restoring wallet...');
    const wallet: WalletContext = await restoreOrCreateWallet(NETWORK, {
        cwd: process.cwd(),
    });
    console.log(` Wallet address: ${wallet.address}`);

    // ── Step 4: Clear previous test data ────────────────────────────────────
    clearAllEscrows();

    // ── Step 5: Deploy a new escrow ─────────────────────────────────────────
    console.log('\n Deploying escrow...');
    const provider = {
        isConnected: true,
        address: wallet.address,
    };

    const deployResult = await deployEscrow(
        {
            buyerAddress: wallet.address,
            sellerAddress: 'mn_shielded_48a9b2c7e1f0d3a5b8c9e2f4a6b8d0c2e4f6a8b0',
            amount: '10.00',
            condition: 'E2E test: deliver test artifact',
        },
        provider as any,
    );

    console.log(` Escrow ID: ${deployResult.escrowId}`);
    console.log(` Contract:  ${deployResult.contractAddress}`);
    console.log(` Tx Hash:   ${deployResult.transactionHash}`);

    // ── Step 6: Verify escrow was created ───────────────────────────────────
    const escrow = getEscrow(deployResult.escrowId);
    if (!escrow) {
        console.error('Escrow not found in store after deployment');
        process.exit(1);
    }
    console.log(`\n Escrow state: ${escrow.stateLabel}`);

    // ── Step 7: Deposit funds ───────────────────────────────────────────────
    console.log('\n Depositing funds...');
    const depositResult = await depositFunds(
        deployResult.escrowId,
        escrow.buyerSecret,
        provider as any,
    );
    console.log(` Deposit: ${depositResult.success ? 'success' : 'failed'}`);
    if (depositResult.success) {
        console.log(` New state: ${depositResult.newState}`);
    }

    // ── Step 8: Cancel escrow ───────────────────────────────────────────────
    console.log('\n Cancelling escrow...');
    const cancelResult = await cancelEscrow(
        deployResult.escrowId,
        escrow.buyerSecret,
        provider as any,
    );
    console.log(` Cancel: ${cancelResult.success ? 'success' : 'failed'}`);
    if (cancelResult.success) {
        console.log(` New state: ${cancelResult.newState}`);
    }

    // ── Step 9: Verify final state ──────────────────────────────────────────
    const finalEscrow = getEscrow(deployResult.escrowId);
    console.log(`\n Final state: ${finalEscrow?.stateLabel}`);

    // ── Step 10: List all escrows ───────────────────────────────────────────
    const allEscrows = listEscrows();
    console.log(`\n Total escrows: ${allEscrows.length}`);

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('\n─── E2E Test Complete ───────────────────────────────────');
    console.log(` Contract:  ${contractAddress}`);
    console.log(` Escrows:   ${allEscrows.length}`);
    console.log(` Last action: ${cancelResult.success ? 'Cancel (success)' : 'Cancel (failed)'}`);
    console.log('');
}

main().catch((err) => {
    console.error('\n E2E test failed:', err);
    process.exit(1);
});
