/**
 * Haven API Server
 * Provides real on-chain escrow operations via the Midnight SDK.
 *
 * Endpoints:
 *   POST /api/escrows         — deploy a new escrow contract on-chain
 *   POST /api/escrows/:id/action — call a circuit (deposit, confirmDelivery, release, etc.)
 *   GET  /api/escrows?buyerAddress=... — list escrows filtered by buyer address
 *   GET  /api/health          — server status
 *
 * Start:  tsx src/server.ts
 */
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

import { deployEscrowOnChain, callCircuit, getCoinMtIndex, getWalletAvailableCoins, getWalletCoinPublicKey } from './midnight-client';
import { env } from './env';

const app = express();
app.use(express.json());

// CORS — frontend runs on :5173, API on :3001
app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    if (_req.method === 'OPTIONS') { res.sendStatus(200); return; }
    next();
});

const PORT = process.env.PORT || 3001;

// ─── Supabase ────────────────────────────────────────────────────────────────

function getSupabase() {
    if (env.SUPABASE_URL && env.SUPABASE_ANON_KEY) {
        return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    }
    return null;
}

// ─── Supabase ↔ Row Mapping ──────────────────────────────────────────────────

function recordToRow(record: any) {
    return {
        id: record.id,
        contract_address: record.contractAddress,
        buyer_address: record.buyerAddress,
        seller_address: record.sellerAddress,
        amount: record.amount,
        condition: record.condition,
        state: record.state,
        state_label: record.stateLabel,
        created_at: record.createdAt,
        updated_at: record.updatedAt,
        funded_at: record.fundedAt,
        delivered_at: record.deliveredAt,
        released_at: record.releasedAt,
        disputed_at: record.disputedAt,
        resolved_at: record.resolvedAt,
        cancelled_at: record.cancelledAt,
        transaction_hash: record.transactionHash,
        deposit_coin_index: record.depositCoinIndex,
        buyer_secret: record.buyerSecret,
        seller_secret: record.sellerSecret,
        salt: record.salt,
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecord(row: any) {
    return {
        id: row.id,
        contractAddress: row.contract_address,
        buyerAddress: row.buyer_address,
        sellerAddress: row.seller_address,
        amount: row.amount,
        condition: row.condition,
        state: row.state,
        stateLabel: row.state_label,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        fundedAt: row.funded_at,
        deliveredAt: row.delivered_at,
        releasedAt: row.released_at,
        disputedAt: row.disputed_at,
        resolvedAt: row.resolved_at,
        cancelledAt: row.cancelled_at,
        transactionHash: row.transaction_hash,
        depositCoinIndex: row.deposit_coin_index,
        buyerSecret: row.buyer_secret,
        sellerSecret: row.seller_secret,
        salt: row.salt,
    };
}

// ─── State Machine ────────────────────────────────────────────────────────────

const STATE_CREATED = 0;
const STATE_FUNDED = 1;
const STATE_DELIVERED = 2;
const STATE_RELEASED = 3;
const STATE_DISPUTED = 4;
const STATE_RESOLVED = 5;
const STATE_CANCELLED = 6;

const STATE_LABELS: Record<number, string> = {
    [STATE_CREATED]: 'Created',
    [STATE_FUNDED]: 'Funded',
    [STATE_DELIVERED]: 'Delivered',
    [STATE_RELEASED]: 'Released',
    [STATE_DISPUTED]: 'Disputed',
    [STATE_RESOLVED]: 'Resolved',
    [STATE_CANCELLED]: 'Cancelled',
};

const VALID_TRANSITIONS: Record<string, Record<number, number>> = {
    deposit: { [STATE_CREATED]: STATE_FUNDED },
    confirmDelivery: { [STATE_FUNDED]: STATE_DELIVERED },
    release: { [STATE_DELIVERED]: STATE_RELEASED },
    cancel: { [STATE_CREATED]: STATE_CANCELLED },
    dispute: { [STATE_FUNDED]: STATE_DISPUTED, [STATE_DELIVERED]: STATE_DISPUTED },
    resolve: { [STATE_DISPUTED]: STATE_RESOLVED },
};

// In-memory store of deposited coin mt_index per escrow id (survives API calls,
// used when the deposit_coin_index column is unavailable in the DB).
const depositCoinIndexStore = new Map<string, string>();

// ─── Health ───────────────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});

// ─── Wallet Info ──────────────────────────────────────────────────────────────

app.get('/api/wallet/coins', async (_req, res) => {
    try {
        const coins = await getWalletAvailableCoins();
        res.json(coins);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to get coins';
        console.error('[API] Get coins error:', message);
        res.status(500).json({ error: message });
    }
});

app.get('/api/wallet/public-key', async (_req, res) => {
    try {
        const pubKey = getWalletCoinPublicKey();
        res.json({ publicKey: pubKey });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to get public key';
        console.error('[API] Get public key error:', message);
        res.status(500).json({ error: message });
    }
});

// ─── Deploy Escrow ────────────────────────────────────────────────────────────

app.post('/api/escrows', async (req, res) => {
    try {
        const { buyerAddress, sellerAddress, amount, condition } = req.body;

        if (!buyerAddress || !sellerAddress || !amount || !condition) {
            res.status(400).json({ error: 'Missing required fields: buyerAddress, sellerAddress, amount, condition' });
            return;
        }

        console.log(`[API] Deploying escrow: buyer=${buyerAddress.slice(0, 20)}..., amount=${amount}`);

        // Generate secrets
        const buyerSecret = crypto.randomUUID().replace(/-/g, '');
        const sellerSecret = crypto.randomUUID().replace(/-/g, '');

        // Deploy on-chain
        const deployResult = await deployEscrowOnChain({
            buyerSecret,
            sellerSecret,
            amount,
            condition,
        });

        // Create escrow record
        const now = new Date().toISOString();
        const escrowRecord = {
            id: `escrow_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 6)}`,
            contractAddress: deployResult.contractAddress,
            buyerAddress,
            sellerAddress,
            amount,
            condition,
            state: STATE_CREATED,
            stateLabel: STATE_LABELS[STATE_CREATED],
            createdAt: now,
            updatedAt: now,
            fundedAt: null,
            deliveredAt: null,
            releasedAt: null,
            disputedAt: null,
            resolvedAt: null,
            cancelledAt: null,
            transactionHash: deployResult.transactionHash,
            depositCoinIndex: null,
            buyerSecret: deployResult.buyerSecret,
            sellerSecret: deployResult.sellerSecret,
            salt: '',
        };

        // Persist to Supabase
        const sb = getSupabase();
        if (sb) {
            const insertRow = recordToRow(escrowRecord);
            let { error } = await sb.from('escrows').insert(insertRow);
            if (error && /column.*deposit_coin_index/i.test(error.message)) {
                // Column missing in DB — retry without it
                const { deposit_coin_index: _drop, ...baseRow } = insertRow;
                void _drop;
                ({ error } = await sb.from('escrows').insert(baseRow));
            }
            if (error) console.error('[API] Supabase insert failed:', error.message);
        }

        console.log(`[API] Escrow deployed: ${escrowRecord.id}, contract: ${deployResult.contractAddress}`);

        res.json(escrowRecord);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Deploy failed';
        console.error('[API] Deploy error:', message);
        res.status(500).json({ error: message });
    }
});

// ─── Escrow Action ────────────────────────────────────────────────────────────

app.post('/api/escrows/:id/action', async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!action) {
            res.status(400).json({ error: 'Missing required field: action' });
            return;
        }

        // Look up escrow
        const sb = getSupabase();
        if (!sb) {
            res.status(500).json({ error: 'Supabase not configured' });
            return;
        }

        const { data: row, error: fetchError } = await sb
            .from('escrows')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !row) {
            res.status(404).json({ error: `Escrow ${id} not found` });
            return;
        }

        const currentState = row.state;
        const transition = VALID_TRANSITIONS[action];

        if (!transition || transition[currentState] === undefined) {
            res.status(400).json({
                error: `Cannot perform ${action} in state ${STATE_LABELS[currentState]}`,
            });
            return;
        }

        const newState = transition[currentState];
        console.log(`[API] Action ${action} on ${id}: ${STATE_LABELS[currentState]} → ${STATE_LABELS[newState]}`);

        // Build circuit arguments based on action
        const circuitArgs: unknown[] = [];
        let depositCoinIndex: string | null = null;

        if (action === 'deposit') {
            const { value } = req.body;
            if (value === undefined) {
                res.status(400).json({ error: 'Missing value for deposit' });
                return;
            }
            circuitArgs.push(BigInt(value));
        } else if (action === 'release') {
            const { sellerPubKey } = req.body;
            if (!sellerPubKey) {
                res.status(400).json({ error: 'Missing sellerPubKey for release' });
                return;
            }
            const coinIndex = row.deposit_coin_index ?? depositCoinIndexStore.get(id);
            if (!coinIndex) {
                res.status(400).json({ error: 'No deposit coin index — deposit first' });
                return;
            }
            circuitArgs.push({ bytes: Uint8Array.from(Buffer.from(sellerPubKey, 'hex')) });
            circuitArgs.push(BigInt(coinIndex));
        } else if (action === 'cancel') {
            const coinIndex = row.deposit_coin_index ?? depositCoinIndexStore.get(id);
            circuitArgs.push(BigInt(coinIndex ?? 0));
        }

        // Call the circuit on-chain
        const circuitResult = await callCircuit(row.contract_address, action, circuitArgs);

        // After deposit: look up the minted coin's mt_index from the indexer
        if (action === 'deposit') {
            try {
                const coinIdx = await getCoinMtIndex(circuitResult.transactionHash, row.contract_address);
                depositCoinIndex = coinIdx.toString();
                depositCoinIndexStore.set(id, depositCoinIndex);
                console.log(`[API] Deposit coin mt_index: ${depositCoinIndex}`);
            } catch (err: unknown) {
                console.error('[API] Failed to lookup coin mt_index:', err instanceof Error ? err.message : err);
            }
        }

        // Update Supabase
        const now = new Date().toISOString();
        const updatedRow = {
            ...row,
            state: newState,
            state_label: STATE_LABELS[newState],
            updated_at: now,
            transaction_hash: circuitResult.transactionHash,
            ...(action === 'deposit' && { funded_at: now }),
            ...(action === 'confirmDelivery' && { delivered_at: now }),
            ...(action === 'release' && { released_at: now }),
            ...(action === 'dispute' && { disputed_at: now }),
            ...(action === 'resolve' && { resolved_at: now }),
            ...(action === 'cancel' && { cancelled_at: now }),
            ...(depositCoinIndex !== null && { deposit_coin_index: depositCoinIndex }),
        };

        let updateError: { message: string } | null = null;
        const { error: err1 } = await sb
            .from('escrows')
            .update(updatedRow)
            .eq('id', id);
        updateError = err1;

        if (updateError && /column.*deposit_coin_index/i.test(updateError.message)) {
            // Column missing in DB — retry without the coin index so state still persists
            const { deposit_coin_index: _drop, ...baseRow } = updatedRow;
            void _drop;
            const { error: err2 } = await sb
                .from('escrows')
                .update(baseRow)
                .eq('id', id);
            updateError = err2;
        }

        if (updateError) console.error('[API] Supabase update failed:', updateError.message);

        console.log(`[API] Action ${action} completed: ${circuitResult.transactionHash}`);

        res.json({
            success: true,
            transactionHash: circuitResult.transactionHash,
            blockHeight: circuitResult.blockHeight,
            newState,
            newStateLabel: STATE_LABELS[newState],
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Action failed';
        console.error('[API] Action error:', message);
        res.status(500).json({ error: message });
    }
});

// ─── List Escrows ─────────────────────────────────────────────────────────────

app.get('/api/escrows', async (req, res) => {
    try {
        const sb = getSupabase();
        if (!sb) {
            res.json([]);
            return;
        }

        let query = sb.from('escrows').select('*');

        const { buyerAddress } = req.query;
        if (buyerAddress) {
            query = query.eq('buyer_address', buyerAddress as string);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('[API] Supabase query failed:', error.message);
            res.status(500).json({ error: error.message });
            return;
        }

        res.json((data || []).map(rowToRecord));
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Query failed';
        res.status(500).json({ error: message });
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`\n  Haven API Server running on http://localhost:${PORT}`);
    console.log(`  Health: http://localhost:${PORT}/api/health\n`);
});
