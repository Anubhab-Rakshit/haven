import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  ArrowRight,
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

  useEffect(() => {
    if (escrow) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [escrow]);

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

  const modalContent = (
    <AnimatePresence>
      <div 
        className="modal-overlay" 
        onClick={onClose}
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="modal-content"
          style={{ maxWidth: '720px', padding: '2.4rem' }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent
        >
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              paddingBottom: '1.25rem',
              marginBottom: '1.6rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(194, 168, 120, 0.08)',
                  border: '1px solid rgba(194, 168, 120, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(194, 168, 120, 0.1)',
                }}
              >
                <ShieldCheck size={20} color="var(--accent-gold)" />
              </div>
              <div>
                <span className="section-label" style={{ marginBottom: '2px' }}>
                  ESCROW CONTRACT AUDIT
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <h2
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1.15rem',
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
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
            >
              <X size={16} />
            </button>
          </div>

          {/* Grid: State & Amount Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* State Card */}
            <div
              style={{
                padding: '1.1rem 1.3rem',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
              }}
            >
              <span className="section-label" style={{ marginBottom: '4px' }}>
                ESCROW STATE
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '4px',
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
                        ? '#a78bfa'
                        : escrow.state === EscrowState.Disputed
                        ? 'var(--accent-crimson)'
                        : 'var(--accent-gold)',
                    boxShadow: '0 0 8px currentColor',
                  }}
                />
                <span>{escrow.stateLabel}</span>
              </div>
            </div>

            {/* Amount Card */}
            <div
              style={{
                padding: '1.1rem 1.3rem',
                background: 'rgba(194, 168, 120, 0.03)',
                border: '1px solid rgba(194, 168, 120, 0.18)',
                borderRadius: '8px',
              }}
            >
              <span className="section-label" style={{ marginBottom: '4px' }}>
                LOCKED VALUE (ZK PEDERSEN)
              </span>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginTop: '4px',
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
              padding: '1.2rem 1.3rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span className="section-label" style={{ marginBottom: 0 }}>
                DELIVERY CONDITION / SPECIFICATION
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--accent-gold)', fontSize: '9px', fontFamily: 'var(--font-mono)' }}>
                <Lock size={10} />
                <span>Pedersen Witness Hash</span>
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
              "{escrow.condition}"
            </p>
          </div>

          {/* State Timeline */}
          <div
            style={{
              padding: '1.3rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <span className="section-label" style={{ marginBottom: '0.85rem' }}>
              LIFECYCLE TIMELINE
            </span>
            <StateTimeline state={escrow.state} />
          </div>

          {/* Counterparties */}
          <div
            style={{
              padding: '1.1rem 1.3rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
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
                padding: '1.3rem',
                background: 'rgba(194, 168, 120, 0.03)',
                border: '1px solid rgba(194, 168, 120, 0.2)',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}
            >
              <span className="section-label" style={{ marginBottom: '0.7rem' }}>
                AVAILABLE STATE MACHINE ACTIONS
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
                      style={{ background: '#8b5cf6', borderColor: '#8b5cf6', color: '#fff' }}
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
              padding: '1.1rem 1.3rem',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '8px',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span className="section-label" style={{ marginBottom: 0 }}>
                ON-CHAIN CRYPTOGRAPHIC PROOF
              </span>
              <a
                href={`https://explorer.preprod.midnight.network/contract/${escrow.contractAddress}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
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
                <span style={{ color: 'var(--text-muted)' }}>Transaction Hash:</span>
                <span style={{ color: 'var(--text-primary)' }}>{escrow.transactionHash}</span>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.75rem' }}>
              <History size={13} color="var(--accent-gold)" />
              <span className="section-label" style={{ marginBottom: 0 }}>
                TRANSACTION AUDIT TRAIL
              </span>
            </div>
            <TransactionHistory transactions={transactions} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
