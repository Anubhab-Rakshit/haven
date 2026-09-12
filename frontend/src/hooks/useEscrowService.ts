import { useState, useEffect, useCallback } from 'react';
import {
  EscrowState,
  ESCROW_STATE_LABELS,
  type EscrowRecord,
  type CreateEscrowRequest,
  type EscrowActionResult,
  type EscrowDeploymentResult,
  type EscrowTransaction,
} from '../types/escrow';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import confetti from 'canvas-confetti';
import {
  fetchEscrows,
  insertEscrow,
  updateEscrow,
  clearAllSupabase,
} from '../lib/supabase';

const STORAGE_KEY = 'haven_escrows_store';
const TX_STORAGE_KEY = 'haven_transactions_store';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `escrow_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 6)}`;
}

function generateTxHash(): string {
  return `mn_tx_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
}

function isValidTransition(current: EscrowState, action: string): boolean {
  const transitions: Record<string, EscrowState[]> = {
    deposit: [EscrowState.Created],
    confirmDelivery: [EscrowState.Funded],
    release: [EscrowState.Delivered],
    cancel: [EscrowState.Created],
    dispute: [EscrowState.Funded, EscrowState.Delivered],
    resolve: [EscrowState.Disputed],
  };
  return transitions[action]?.includes(current) ?? false;
}

function nextState(action: string): EscrowState | null {
  const map: Record<string, EscrowState> = {
    deposit: EscrowState.Funded,
    confirmDelivery: EscrowState.Delivered,
    release: EscrowState.Released,
    dispute: EscrowState.Disputed,
    resolve: EscrowState.Resolved,
    cancel: EscrowState.Cancelled,
  };
  return map[action] ?? null;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_ESCROWS: EscrowRecord[] = [
  {
    id: 'escrow_7f8a91b2c3d4',
    contractAddress: 'mn_contract_7f8a91b2c3d4e5f6',
    buyerAddress: 'mn_shielded_19f8a3c82d4e7b1a9c3e5d7f2a1b4c6e8d0f2a4b',
    sellerAddress: 'mn_shielded_48a9b2c7e1f0d3a5b8c9e2f4a6b8d0c2e4f6a8b0',
    amount: '450.00',
    token: 'tDUST',
    condition: 'Deliver finalized zero-knowledge cryptographic audit report for Phase 1 smart contracts.',
    state: EscrowState.Funded,
    stateLabel: ESCROW_STATE_LABELS[EscrowState.Funded],
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    fundedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    deliveredAt: null,
    releasedAt: null,
    disputedAt: null,
    resolvedAt: null,
    cancelledAt: null,
    transactionHash: 'mn_tx_8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
    buyerSecret: 'sec_b_948f2190ab7c4e12',
    sellerSecret: 'sec_s_38f9024bcd18ef44',
    salt: 'salt_88f9104bcde',
  },
  {
    id: 'escrow_3e4f5a6b7c8d',
    contractAddress: 'mn_contract_3e4f5a6b7c8d9e0f',
    buyerAddress: 'mn_shielded_19f8a3c82d4e7b1a9c3e5d7f2a1b4c6e8d0f2a4b',
    sellerAddress: 'mn_shielded_92c4e6a8b0d2f4a6b8c0e2d4f6a8b0c2e4f6a8b1',
    amount: '1,200.00',
    token: 'tDUST',
    condition: 'Complete backend integration of Compact zk circuits and pass all 90 unit verification suites.',
    state: EscrowState.Delivered,
    stateLabel: ESCROW_STATE_LABELS[EscrowState.Delivered],
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    fundedAt: new Date(Date.now() - 3600 * 1000 * 68).toISOString(),
    deliveredAt: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
    releasedAt: null,
    disputedAt: null,
    resolvedAt: null,
    cancelledAt: null,
    transactionHash: 'mn_tx_1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
    buyerSecret: 'sec_b_11a8c90fe324bca8',
    sellerSecret: 'sec_s_77b310ef9234adbc',
    salt: 'salt_123acb789ef',
  },
  {
    id: 'escrow_9a0b1c2d3e4f',
    contractAddress: 'mn_contract_9a0b1c2d3e4f5a6b',
    buyerAddress: 'mn_shielded_19f8a3c82d4e7b1a9c3e5d7f2a1b4c6e8d0f2a4b',
    sellerAddress: 'mn_shielded_33d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2',
    amount: '85.50',
    token: 'tDUST',
    condition: 'Deliver custom WebGL liquid shader and brand typography tokens for Haven user interface.',
    state: EscrowState.Created,
    stateLabel: ESCROW_STATE_LABELS[EscrowState.Created],
    createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    fundedAt: null,
    deliveredAt: null,
    releasedAt: null,
    disputedAt: null,
    resolvedAt: null,
    cancelledAt: null,
    transactionHash: 'mn_tx_5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
    buyerSecret: 'sec_b_4938fabc1092384a',
    sellerSecret: 'sec_s_8829fbcde019284b',
    salt: 'salt_9988776655a',
  },
];

const SEED_TRANSACTIONS: Record<string, EscrowTransaction[]> = {
  escrow_7f8a91b2c3d4: [
    {
      hash: 'mn_tx_8a9b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
      blockHeight: 1842910,
      timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
      type: 'Deposit Funds',
      stateLabel: 'Funded',
    },
    {
      hash: 'mn_tx_11223344556677889900aabbccddeeff',
      blockHeight: 1842820,
      timestamp: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
      type: 'Deploy Escrow',
      stateLabel: 'Created',
    },
  ],
  escrow_3e4f5a6b7c8d: [
    {
      hash: 'mn_tx_1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e',
      blockHeight: 1843105,
      timestamp: new Date(Date.now() - 3600 * 1000 * 6).toISOString(),
      type: 'Confirm Delivery',
      stateLabel: 'Delivered',
    },
  ],
  escrow_9a0b1c2d3e4f: [
    {
      hash: 'mn_tx_5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c',
      blockHeight: 1844012,
      timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      type: 'Deploy Escrow',
      stateLabel: 'Created',
    },
  ],
};

// ─── Exported Interface ────────────────────────────────────────────────────────

export interface UseEscrowServiceReturn {
  escrows: EscrowRecord[];
  selectedEscrow: EscrowRecord | null;
  isLoading: boolean;
  error: string | null;
  transactions: Record<string, EscrowTransaction[]>;

  createEscrow: (request: CreateEscrowRequest) => Promise<EscrowDeploymentResult>;
  deposit: (escrowId: string) => Promise<EscrowActionResult>;
  confirmDelivery: (escrowId: string) => Promise<EscrowActionResult>;
  release: (escrowId: string) => Promise<EscrowActionResult>;
  dispute: (escrowId: string) => Promise<EscrowActionResult>;
  resolve: (escrowId: string) => Promise<EscrowActionResult>;
  cancel: (escrowId: string) => Promise<EscrowActionResult>;

  selectEscrow: (escrowId: string) => void;
  clearSelection: () => void;
  refresh: () => Promise<void>;
  resetToDefaults: () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useEscrowService(): UseEscrowServiceReturn {
  const wallet = useMidnightWallet();

  const [escrows, setEscrows] = useState<EscrowRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_ESCROWS;
  });

  const [transactions, setTransactions] = useState<Record<string, EscrowTransaction[]>>(() => {
    try {
      const saved = localStorage.getItem(TX_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_TRANSACTIONS;
  });

  const [selectedEscrowId, setSelectedEscrowId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(escrows));
  }, [escrows]);

  useEffect(() => {
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const selectedEscrow = escrows.find((e) => e.id === selectedEscrowId) || null;

  const selectEscrow = useCallback((escrowId: string) => {
    setSelectedEscrowId(escrowId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedEscrowId(null);
  }, []);

  // ─── Fire Confetti ────────────────────────────────────────────────────────

  const fireConfetti = useCallback((colors?: string[]) => {
    try {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.7 },
        colors: colors || ['#34d399', '#c2a878'],
      });
    } catch {
      // ignore
    }
  }, []);

  // ─── Add Transaction Helper ───────────────────────────────────────────────

  const addTransaction = useCallback((escrowId: string, type: string, stateLabel: string, txHash?: string) => {
    const newTx: EscrowTransaction = {
      hash: txHash || generateTxHash(),
      blockHeight: 1844000 + Math.floor(Math.random() * 500),
      timestamp: new Date().toISOString(),
      type,
      stateLabel,
    };

    setTransactions((prev) => ({
      ...prev,
      [escrowId]: [newTx, ...(prev[escrowId] || [])],
    }));
  }, []);

  // ─── Refresh: Supabase as source of truth ────────────────────────────────

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sbEscrows = await fetchEscrows();
      if (sbEscrows.length > 0) {
        const mapped: EscrowRecord[] = sbEscrows.map((r) => ({
          ...r,
          token: 'tDUST',
          state: r.state as unknown as EscrowState,
          stateLabel: ESCROW_STATE_LABELS[r.state as unknown as EscrowState],
        }));
        setEscrows(mapped);
      } else {
        // No Supabase data — keep seed data
        setEscrows(SEED_ESCROWS);
      }
    } catch (err: unknown) {
      console.warn('Supabase refresh failed, keeping local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load from Supabase on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ─── Reset to Defaults ────────────────────────────────────────────────────

  const resetToDefaults = useCallback(async () => {
    await clearAllSupabase();
    setEscrows(SEED_ESCROWS);
    setTransactions(SEED_TRANSACTIONS);
    setSelectedEscrowId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TX_STORAGE_KEY);
  }, []);

  // ─── Create Escrow ────────────────────────────────────────────────────────

  const createEscrow = useCallback(
    async (request: CreateEscrowRequest): Promise<EscrowDeploymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const id = generateId();
        const txHash = generateTxHash();
        const now = new Date().toISOString();

        const record: EscrowRecord = {
          id,
          contractAddress: 'c1948db2a7c3a8b9c632ddfe1b9a164daa2f6e19b707bc06f4b2d5f93576bf7b',
          buyerAddress: wallet.address || request.buyerAddress,
          sellerAddress: request.sellerAddress,
          amount: request.amount,
          token: request.token || 'tDUST',
          condition: request.condition,
          state: EscrowState.Created,
          stateLabel: ESCROW_STATE_LABELS[EscrowState.Created],
          createdAt: now,
          updatedAt: now,
          fundedAt: null,
          deliveredAt: null,
          releasedAt: null,
          disputedAt: null,
          resolvedAt: null,
          cancelledAt: null,
          transactionHash: txHash,
          buyerSecret: '',
          sellerSecret: '',
          salt: '',
        };

        // Persist to Supabase
        await insertEscrow(record);

        setEscrows((prev) => [record, ...prev]);
        addTransaction(id, 'Deploy Escrow', 'Created', txHash);
        fireConfetti(['#c2a878', '#34d399', '#8b5cf6']);

        return {
          escrowId: id,
          contractAddress: record.contractAddress,
          transactionHash: txHash,
          buyerCommitment: '',
          sellerCommitment: '',
          amountCommitment: '',
          conditionCommitment: '',
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to create escrow';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [wallet.address, addTransaction, fireConfetti]
  );

  // ─── Generic State Transition ─────────────────────────────────────────────

  const performTransition = useCallback(
    async (
      escrowId: string,
      action: string,
      actionLabel: string,
      updateFields: Partial<EscrowRecord> = {}
    ): Promise<EscrowActionResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const escrow = escrows.find((e) => e.id === escrowId);
        if (!escrow) {
          throw new Error(`Escrow ${escrowId} not found`);
        }

        if (!isValidTransition(escrow.state, action)) {
          return {
            success: false,
            transactionHash: '',
            blockHeight: 0,
            newState: escrow.state,
            error: `Cannot perform ${actionLabel} in state ${escrow.stateLabel}`,
          };
        }

        const ns = nextState(action);
        if (ns === null) {
          return {
            success: false,
            transactionHash: '',
            blockHeight: 0,
            newState: escrow.state,
            error: `Unknown action: ${action}`,
          };
        }

        const txHash = generateTxHash();
        const now = new Date().toISOString();

        const updated: EscrowRecord = {
          ...escrow,
          state: ns,
          stateLabel: ESCROW_STATE_LABELS[ns],
          updatedAt: now,
          transactionHash: txHash,
          ...updateFields,
        };

        // Persist to Supabase
        await updateEscrow(escrowId, updated);

        setEscrows((prev) =>
          prev.map((item) => (item.id === escrowId ? updated : item))
        );

        addTransaction(escrowId, actionLabel, ESCROW_STATE_LABELS[ns], txHash);

        if (ns === EscrowState.Released || ns === EscrowState.Resolved) {
          fireConfetti();
        }

        return {
          success: true,
          transactionHash: txHash,
          blockHeight: Math.floor(Math.random() * 1000000),
          newState: ns,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : `Failed to execute ${actionLabel}`;
        setError(message);
        return {
          success: false,
          transactionHash: '',
          blockHeight: 0,
          newState: EscrowState.Created,
          error: message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [escrows, addTransaction, fireConfetti]
  );

  // ─── Escrow Actions ───────────────────────────────────────────────────────

  const deposit = useCallback(
    (escrowId: string) =>
      performTransition(escrowId, 'deposit', 'Deposit Funds', {
        fundedAt: new Date().toISOString(),
      }),
    [performTransition]
  );

  const confirmDelivery = useCallback(
    (escrowId: string) =>
      performTransition(escrowId, 'confirmDelivery', 'Confirm Delivery', {
        deliveredAt: new Date().toISOString(),
      }),
    [performTransition]
  );

  const release = useCallback(
    (escrowId: string) =>
      performTransition(escrowId, 'release', 'Release Funds', {
        releasedAt: new Date().toISOString(),
      }),
    [performTransition]
  );

  const dispute = useCallback(
    (escrowId: string) =>
      performTransition(escrowId, 'dispute', 'Raise Dispute', {
        disputedAt: new Date().toISOString(),
      }),
    [performTransition]
  );

  const resolve = useCallback(
    (escrowId: string) =>
      performTransition(escrowId, 'resolve', 'Resolve Dispute', {
        resolvedAt: new Date().toISOString(),
      }),
    [performTransition]
  );

  const cancel = useCallback(
    (escrowId: string) =>
      performTransition(escrowId, 'cancel', 'Cancel Escrow', {
        cancelledAt: new Date().toISOString(),
      }),
    [performTransition]
  );

  return {
    escrows,
    selectedEscrow,
    isLoading,
    error,
    transactions,
    createEscrow,
    deposit,
    confirmDelivery,
    release,
    dispute,
    resolve,
    cancel,
    selectEscrow,
    clearSelection,
    refresh,
    resetToDefaults,
  };
}
