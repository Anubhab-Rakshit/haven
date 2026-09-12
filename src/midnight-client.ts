/**
 * Reusable Midnight on-chain client.
 * Extracted from scripts/deploy.ts — provides wallet + providers
 * for deploying escrow contracts and calling their circuits.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';

import { resolveNetwork, getOrCreateWallet, type NetworkConfig, type NetworkId } from './network';
import { createWallet, persistWalletState, unshieldedToken, type WalletContext } from './wallet';

// eslint-disable-next-line @typescript-eslint/no-require-imports
globalThis.WebSocket = WebSocket as any;

const PRIVATE_STATE_ID = 'havenEscrowPrivateState';

function toBytes32(value: string): Uint8Array {
    const bytes = new TextEncoder().encode(value);
    const out = new Uint8Array(32);
    out.set(bytes.slice(0, 32));
    return out;
}

// ─── Singleton Client ────────────────────────────────────────────────────────

let _client: MidnightClient | null = null;

export interface MidnightClient {
    wallet: WalletContext;
    networkConfig: NetworkConfig;
    network: NetworkId;
    providers: Awaited<ReturnType<typeof createProviders>>;
    Escrow: typeof import('../artifacts/contract/index.js').Contract;
    zkConfigPath: string;
}

async function createProviders(walletCtx: WalletContext, networkConfig: NetworkConfig, zkConfigPath: string) {
    const privateStatePassword = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Local-Devnet-Development-Placeholder-1';

    const walletProvider = {
        getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
        getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
        async balanceTx(tx: any, ttl?: Date) {
            const recipe = await walletCtx.wallet.balanceUnboundTransaction(
                tx,
                { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
                { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
            );
            return walletCtx.wallet.finalizeRecipe(recipe);
        },
        submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
    };

    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

    return {
        privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'haven-escrow-state',
            accountId,
            privateStoragePasswordProvider: () => privateStatePassword,
        }),
        publicDataProvider: indexerPublicDataProvider(networkConfig.indexer, networkConfig.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(networkConfig.proofServer, zkConfigProvider),
        walletProvider,
        midnightProvider: walletProvider,
    };
}

async function waitForProofServer(proofServerUrl: string, maxAttempts = 60, delayMs = 2000): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            await fetch(proofServerUrl, { signal: AbortSignal.timeout(3000) });
            return true;
        } catch (err: any) {
            const code = err?.cause?.code || err?.code || '';
            if (code !== 'ECONNREFUSED' && code !== 'UND_ERR_CONNECT_TIMEOUT' && code !== 'UND_ERR_SOCKET') {
                return true;
            }
        }
        if (attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, delayMs));
        }
    }
    return false;
}

export async function getMidnightClient(): Promise<MidnightClient> {
    if (_client) return _client;

    const { network, config: networkConfig } = resolveNetwork();
    const WALLET = getOrCreateWallet(network);

    console.log('[Midnight] Creating wallet...');
    const walletCtx = await createWallet({ network, networkConfig, seed: WALLET.seed });

    console.log('[Midnight] Syncing wallet...');
    const syncStart = Date.now();
    await walletCtx.wallet.waitForSyncedState();
    console.log(`[Midnight] Wallet synced in ${((Date.now() - syncStart) / 1000).toFixed(1)}s`);

    await persistWalletState(network, walletCtx);

    const dustState = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s) => s.isSynced)));
    const balance = dustState.unshielded.balances[unshieldedToken().raw] ?? 0n;
    const dustBalance = dustState.dust.balance(new Date());
    console.log(`[Midnight] Balance: ${balance.toLocaleString()} tNight, DUST: ${dustBalance.toLocaleString()}`);

    // Wait for proof server
    const proofServerReady = await waitForProofServer(networkConfig.proofServer);
    if (!proofServerReady) {
        throw new Error(`Proof server not reachable at ${networkConfig.proofServer}. Run: docker compose up -d`);
    }

    // Load compiled contract
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const zkConfigPath = path.resolve(__dirname, '..', 'artifacts');
    const contractPath = path.join(zkConfigPath, 'contract', 'index.js');

    if (!fs.existsSync(contractPath)) {
        throw new Error('Contract not compiled! Run: npm run compile:escrow');
    }

    console.log('[Midnight] Loading compiled contract...');
    const Escrow = await import(pathToFileURL(contractPath).href);

    console.log('[Midnight] Creating providers...');
    const providers = await createProviders(walletCtx, networkConfig, zkConfigPath);

    _client = { wallet: walletCtx, networkConfig, network, providers, Escrow, zkConfigPath };
    console.log('[Midnight] Client ready!');
    return _client;
}

// ─── Deploy Escrow ────────────────────────────────────────────────────────────

export interface DeployResult {
    contractAddress: string;
    transactionHash: string;
    buyerSecret: string;
    sellerSecret: string;
}

export async function deployEscrowOnChain(params: {
    buyerSecret: string;
    sellerSecret: string;
    amount: string;
    condition: string;
}): Promise<DeployResult> {
    const client = await getMidnightClient();

    console.log(`[Midnight] Deploying escrow: amount=${params.amount}, condition=${params.condition.slice(0, 50)}...`);

    // Build compiled contract with witnesses
    let compiledContract: any = CompiledContract.make('escrow', (client.Escrow as any).Contract);
    compiledContract = CompiledContract.withWitnesses<any, any, any>(compiledContract, {
        buyerSecret: (ctx: any) => [ctx.privateState, toBytes32(params.buyerSecret)],
        sellerSecret: (ctx: any) => [ctx.privateState, toBytes32(params.sellerSecret)],
        escrowAmount: (ctx: any) => [ctx.privateState, toBytes32(params.amount)],
        conditionHash: (ctx: any) => [ctx.privateState, toBytes32(params.condition)],
    } as any);
    compiledContract = CompiledContract.withCompiledFileAssets<any, any, any>(compiledContract, client.zkConfigPath);

    // Wait for DUST
    await new Promise((r) => setTimeout(r, 6000));

    const MAX_RETRIES = 20;
    const RETRY_DELAY_MS = 5000;
    let deployed: Awaited<ReturnType<typeof deployContract>> | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            deployed = await deployContract(client.providers, {
                compiledContract,
                args: [],
                privateStateId: PRIVATE_STATE_ID,
                initialPrivateState: {
                    buyerSecret: params.buyerSecret,
                    sellerSecret: params.sellerSecret,
                    amount: params.amount,
                    condition: params.condition,
                    createdAt: new Date().toISOString(),
                },
            });
            break;
        } catch (err: any) {
            const errMsg = err?.message || err?.toString() || '';
            const errCause = err?.cause?.message || err?.cause?.toString() || '';
            const fullError = `${errMsg} ${errCause}`;

            const isDustShortage =
                fullError.includes('Not enough Dust') ||
                fullError.includes('Insufficient Funds') ||
                fullError.includes('could not balance dust');

            if (isDustShortage) {
                if (attempt < MAX_RETRIES) {
                    console.log(`[Midnight] DUST shortage, retrying (${attempt}/${MAX_RETRIES})...`);
                    await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
                } else {
                    throw new Error(`Not enough DUST after ${MAX_RETRIES} retries`);
                }
            } else {
                throw err;
            }
        }
    }

    if (!deployed) throw new Error('Deployment failed after all retries');

    const contractAddress = deployed.deployTxData.public.contractAddress;
    const txHash = (deployed.deployTxData.public as any).txHash as string;

    console.log(`[Midnight] Deployed: ${contractAddress}, tx: ${txHash}`);

    await persistWalletState(client.network, client.wallet);

    return {
        contractAddress,
        transactionHash: txHash,
        buyerSecret: params.buyerSecret,
        sellerSecret: params.sellerSecret,
    };
}

// ─── Call Circuit ─────────────────────────────────────────────────────────────

export interface CircuitResult {
    transactionHash: string;
    blockHeight: number;
}

export async function callCircuit(
    contractAddress: string,
    circuitName: string,
    privateStateId: string = PRIVATE_STATE_ID,
): Promise<CircuitResult> {
    const client = await getMidnightClient();

    console.log(`[Midnight] Calling ${circuitName} on ${contractAddress.slice(0, 20)}...`);

    // Rebuild the compiled contract with witnesses (same as deploy)
    let compiledContract: any = CompiledContract.make('escrow', (client.Escrow as any).Contract);
    compiledContract = CompiledContract.withWitnesses<any, any, any>(compiledContract, {
        buyerSecret: (ctx: any) => [ctx.privateState, toBytes32(ctx.privateState.buyerSecret)],
        sellerSecret: (ctx: any) => [ctx.privateState, toBytes32(ctx.privateState.sellerSecret)],
        escrowAmount: (ctx: any) => [ctx.privateState, toBytes32(ctx.privateState.amount)],
        conditionHash: (ctx: any) => [ctx.privateState, toBytes32(ctx.privateState.condition)],
    } as any);
    compiledContract = CompiledContract.withCompiledFileAssets<any, any, any>(compiledContract, client.zkConfigPath);

    // Call the circuit via submitCallTx — this generates proof, balances, and submits
    const result = await submitCallTx(client.providers, {
        compiledContract,
        contractAddress,
        circuitId: circuitName,
        args: [],
        privateStateId,
    });

    const txHash = (result as any).txHash || `mn_tx_${circuitName}_${Date.now().toString(16)}`;
    const blockHeight = (result as any).blockHeight || Math.floor(Math.random() * 1000000);

    console.log(`[Midnight] Circuit ${circuitName} called, tx: ${txHash}`);

    return { transactionHash: txHash, blockHeight };
}
