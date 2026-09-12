import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EscrowRecord } from '../types/escrow';
import { AlertTriangle, ShieldCheck, ArrowRight, Loader2, X } from 'lucide-react';

export type ActionType =
  | 'deposit'
  | 'confirmDelivery'
  | 'release'
  | 'dispute'
  | 'resolve'
  | 'cancel';

interface ActionModalProps {
  isOpen: boolean;
  actionType: ActionType | null;
  escrow: EscrowRecord | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

const ACTION_CONFIGS: Record<
  ActionType,
  {
    title: string;
    description: (escrow: EscrowRecord) => string;
    confirmLabel: string;
    buttonClass: string;
    isDestructive: boolean;
    icon: React.ReactNode;
  }
> = {
  deposit: {
    title: 'Deposit Funds into Escrow',
    description: (escrow) =>
      `You are about to deposit ${escrow.amount} ${escrow.token || 'tDUST'} into shielded smart contract ${escrow.contractAddress.slice(0, 14)}... This action binds the funds under ZK condition verification.`,
    confirmLabel: 'Confirm Shielded Deposit',
    buttonClass: 'btn-primary',
    isDestructive: false,
    icon: <ShieldCheck size={20} color="var(--accent-gold)" />,
  },
  confirmDelivery: {
    title: 'Confirm Delivery of Condition',
    description: () =>
      'You are confirming that the specified delivery conditions and cryptographic proofs have been verified satisfactorily. This advances the escrow to the delivery phase.',
    confirmLabel: 'Confirm Delivery',
    buttonClass: 'btn-primary',
    isDestructive: false,
    icon: <ShieldCheck size={20} color="var(--accent-violet)" />,
  },
  release: {
    title: 'Release Funds to Seller',
    description: (escrow) =>
      `Funds totaling ${escrow.amount} ${escrow.token || 'tDUST'} will be permanently released to the seller's shielded address (${escrow.sellerAddress.slice(0, 14)}...). This action is irreversible.`,
    confirmLabel: 'Release Payout',
    buttonClass: 'btn-emerald',
    isDestructive: false,
    icon: <ShieldCheck size={20} color="var(--accent-emerald)" />,
  },
  dispute: {
    title: 'Raise Escrow Dispute',
    description: () =>
      'A formal dispute will be registered on the Midnight Network ledger. An independent arbitrator will evaluate condition witnesses and determine final settlement.',
    confirmLabel: 'Initiate Dispute',
    buttonClass: 'btn-crimson',
    isDestructive: true,
    icon: <AlertTriangle size={20} color="var(--accent-crimson)" />,
  },
  resolve: {
    title: 'Resolve Dispute & Settle',
    description: () =>
      'Execute arbitrator resolution settlement. Contract state will be finalized and shielded funds routed according to verdict.',
    confirmLabel: 'Finalize Resolution',
    buttonClass: 'btn-primary',
    isDestructive: false,
    icon: <ShieldCheck size={20} color="var(--accent-gold)" />,
  },
  cancel: {
    title: 'Cancel Escrow Contract',
    description: () =>
      'The escrow contract will be marked cancelled. No token transfer will occur and state will be permanently closed.',
    confirmLabel: 'Cancel Escrow',
    buttonClass: 'btn-secondary',
    isDestructive: true,
    icon: <AlertTriangle size={20} color="var(--text-muted)" />,
  },
};

export const ActionModal: React.FC<ActionModalProps> = ({
  isOpen,
  actionType,
  escrow,
  onClose,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !actionType || !escrow) return null;

  const config = ACTION_CONFIGS[actionType];

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      // handled upstream
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="modal-content"
          style={{ maxWidth: '480px', padding: '2rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {config.icon}
              </div>
              <div>
                <span className="section-label" style={{ marginBottom: '2px' }}>
                  Confirmation Required
                </span>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.4rem',
                    fontStyle: 'italic',
                    letterSpacing: '-0.02em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.2,
                  }}
                >
                  {config.title}
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
            }}
          >
            {config.description(escrow)}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className={config.buttonClass}
              onClick={handleConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{config.confirmLabel}</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
