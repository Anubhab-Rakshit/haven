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
import { apiFetch } from '../lib/api';

const STORAGE_KEY = 'haven_escrows_store';
const TX_STORAGE_KEY = 'haven_transactions_store';

// ─── Helpers ───────────────────────────────────────────────────────────────────

function generateTxHash(): string {
  return `mn_tx_${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`;
}

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

  const [escrows, setEscrows] = useState<EscrowRecord[]>([]);
  const [transactions, setTransactions] = useState<Record<string, EscrowTransaction[]>>({});
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

  // ─── Refresh: API as source of truth, filtered by wallet address ──────────

  const refresh = useCallback(async () => {
    if (!wallet.address) return;

    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ buyerAddress: wallet.address });
      const data = await apiFetch(`/api/escrows?${params}`);
      const mapped: EscrowRecord[] = data.map((r: any) => ({
        ...r,
        token: 'tDUST',
        state: r.state as unknown as EscrowState,
        stateLabel: ESCROW_STATE_LABELS[r.state as unknown as EscrowState],
      }));
      setEscrows(mapped);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load escrows';
      console.warn('API refresh failed:', message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address]);

  // Load from API on mount and when wallet changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  // ─── Reset (clear local state) ────────────────────────────────────────────

  const resetToDefaults = useCallback(() => {
    setEscrows([]);
    setTransactions({});
    setSelectedEscrowId(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TX_STORAGE_KEY);
  }, []);

  // ─── Create Escrow (real on-chain deploy via API) ─────────────────────────

  const createEscrow = useCallback(
    async (request: CreateEscrowRequest): Promise<EscrowDeploymentResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await apiFetch('/api/escrows', {
          method: 'POST',
          body: JSON.stringify({
            buyerAddress: wallet.address || request.buyerAddress,
            sellerAddress: request.sellerAddress,
            amount: request.amount,
            condition: request.condition,
          }),
        });

        const record: EscrowRecord = {
          ...data,
          token: request.token || 'tDUST',
          state: data.state as unknown as EscrowState,
          stateLabel: ESCROW_STATE_LABELS[data.state as unknown as EscrowState],
        };

        setEscrows((prev) => [record, ...prev]);
        addTransaction(record.id, 'Deploy Escrow', 'Created', record.transactionHash);
        fireConfetti(['#c2a878', '#34d399', '#8b5cf6']);

        return {
          escrowId: record.id,
          contractAddress: record.contractAddress,
          transactionHash: record.transactionHash,
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

  // ─── Generic State Transition (real on-chain via API) ──────────────────────

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
        const data = await apiFetch(`/api/escrows/${escrowId}/action`, {
          method: 'POST',
          body: JSON.stringify({ action }),
        });

        const newState = data.newState as unknown as EscrowState;
        const txHash = data.transactionHash as string;

        setEscrows((prev) =>
          prev.map((item) => {
            if (item.id === escrowId) {
              return {
                ...item,
                state: newState,
                stateLabel: ESCROW_STATE_LABELS[newState],
                updatedAt: new Date().toISOString(),
                transactionHash: txHash,
                ...updateFields,
              };
            }
            return item;
          })
        );

        addTransaction(escrowId, actionLabel, ESCROW_STATE_LABELS[newState], txHash);

        if (newState === EscrowState.Released || newState === EscrowState.Resolved) {
          fireConfetti();
        }

        return {
          success: true,
          transactionHash: txHash,
          blockHeight: data.blockHeight || 0,
          newState,
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
    [addTransaction, fireConfetti]
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
