import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EscrowRecord, EscrowState, EscrowTransaction } from '../types/escrow';
import { StateTimeline } from './StateTimeline';
import { PrivacyToggle } from './PrivacyToggle';
import { TransactionHistory } from './TransactionHistory';
import { ActionType } from './ActionModal';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Coins,
  FileText,
  User,
  History,
  Lock,
} from 'lucide-react';

interface EscrowDetailModalProps {
  escrow: EscrowRecord | null;
  transactions: EscrowTransaction[];
  onClose: () => void;
  onActionClick: (actionType: ActionType, escrow: EscrowRecord) => void;
}

export const EscrowDetailModal: React.FC<EscrowDetailModalProps> = ({
  escrow,
  transactions,
  onClose,
  onActionClick,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!escrow) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isTerminal =
    escrow.state === EscrowState.Released ||
    escrow.state === EscrowState.Resolved ||
    escrow.state === EscrowState.Cancelled;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="modal-content"
          style={{ maxWidth: '680px', padding: '2.2rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span className="section-label" style={{ marginBottom: '2px' }}>
                Escrow Details
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  {escrow.id}
                </h2>
                <button
                  type="button"
                  onClick={() => copyToClipboard(escrow.id, 'id')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  title="Copy Escrow ID"
                >
                  {copiedKey === 'id' ? <Check size={13} color="var(--accent-emerald)" /> : <Copy size={13} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Grid: State & Amount Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* State Card */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
              }}
            >
              <span className="section-label" style={{ marginBottom: '4px' }}>
                Escrow Status
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '2px',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background:
                      escrow.state === EscrowState.Funded || escrow.state === EscrowState.Released
                        ? 'var(--accent-emerald)'
                        : escrow.state === EscrowState.Delivered
                        ? 'var(--accent-violet)'
                        : escrow.state === EscrowState.Disputed
                        ? 'var(--accent-crimson)'
                        : 'var(--accent-gold)',
                  }}
                />
                <span>{escrow.stateLabel}</span>
              </div>
            </div>

            {/* Amount Card */}
            <div
              style={{
                padding: '1rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
              }}
            >
              <span className="section-label" style={{ marginBottom: '4px' }}>
                Locked Value (Private ZK)
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginTop: '2px',
                }}
              >
                <PrivacyToggle
                  value={escrow.amount}
                  suffix={escrow.token || 'tDUST'}
                  storageKey={escrow.id}
                />
              </div>
            </div>
          </div>

          {/* Condition Box */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span className="section-label" style={{ marginBottom: 0 }}>
                Delivery Condition / Specification
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-gold)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                <Lock size={10} />
                <span>Pedersen Witness</span>
              </div>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--text-primary)',
              }}
            >
              {escrow.condition}
            </p>
          </div>

          {/* State Timeline */}
          <div
            style={{
              padding: '1.25rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <span className="section-label" style={{ marginBottom: '0.75rem' }}>
              Lifecycle Timeline
            </span>
            <StateTimeline state={escrow.state} />
          </div>

          {/* Counterparties */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {/* Buyer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>BUYER (SHIELDED):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  {escrow.buyerAddress.slice(0, 16)}...{escrow.buyerAddress.slice(-6)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(escrow.buyerAddress, 'buyer')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {copiedKey === 'buyer' ? <Check size={11} color="var(--accent-emerald)" /> : <Copy size={11} />}
                </button>
              </div>
            </div>

            {/* Seller */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              <span style={{ color: 'var(--text-muted)' }}>SELLER (SHIELDED):</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  {escrow.sellerAddress.slice(0, 16)}...{escrow.sellerAddress.slice(-6)}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(escrow.sellerAddress, 'seller')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {copiedKey === 'seller' ? <Check size={11} color="var(--accent-emerald)" /> : <Copy size={11} />}
                </button>
              </div>
            </div>
          </div>

          {/* Contextual Actions Bar */}
          {!isTerminal && (
            <div
              style={{
                padding: '1.25rem',
                background: 'rgba(194, 168, 120, 0.03)',
                border: '1px solid rgba(194, 168, 120, 0.2)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              <span className="section-label" style={{ marginBottom: '0.6rem' }}>
                Available State Machine Actions
              </span>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
                {escrow.state === EscrowState.Created && (
                  <>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => onActionClick('deposit', escrow)}
                    >
                      <span>Deposit Funds</span>
                    </button>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => onActionClick('cancel', escrow)}
                    >
                      <span>Cancel Escrow</span>
                    </button>
                  </>
                )}

                {escrow.state === EscrowState.Funded && (
                  <>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ background: 'var(--accent-violet)', borderColor: 'var(--accent-violet)', color: '#fff' }}
                      onClick={() => onActionClick('confirmDelivery', escrow)}
                    >
                      <span>Confirm Delivery</span>
                    </button>
                    <button
                      type="button"
                      className="btn-crimson"
                      onClick={() => onActionClick('dispute', escrow)}
                    >
                      <span>Raise Dispute</span>
                    </button>
                  </>
                )}

                {escrow.state === EscrowState.Delivered && (
                  <>
                    <button
                      type="button"
                      className="btn-emerald"
                      onClick={() => onActionClick('release', escrow)}
                    >
                      <span>Release Funds to Seller</span>
                    </button>
                    <button
                      type="button"
                      className="btn-crimson"
                      onClick={() => onActionClick('dispute', escrow)}
                    >
                      <span>Raise Dispute</span>
                    </button>
                  </>
                )}

                {escrow.state === EscrowState.Disputed && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => onActionClick('resolve', escrow)}
                  >
                    <span>Execute Arbitrator Resolution</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* On-Chain Proof Section */}
          <div
            style={{
              padding: '1.1rem 1.25rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="section-label" style={{ marginBottom: 0 }}>
                On-Chain Cryptographic Proof
              </span>
              <a
                href={`https://explorer.preprod.midnight.network/contract/${escrow.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  color: 'var(--accent-gold)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textDecoration: 'none',
                }}
              >
                <span>Explorer</span>
                <ExternalLink size={11} />
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Contract Hash:</span>
                <span style={{ color: 'var(--text-primary)' }}>{escrow.contractAddress}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Last Transaction:</span>
                <span style={{ color: 'var(--text-primary)' }}>{escrow.transactionHash}</span>
              </div>
            </div>
          </div>

          {/* Transaction History Audit */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <History size={13} color="var(--accent-gold)" />
              <span className="section-label" style={{ marginBottom: 0 }}>
                Transaction History
              </span>
            </div>
            <TransactionHistory transactions={transactions} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
