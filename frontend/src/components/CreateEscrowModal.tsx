import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { type CreateEscrowRequest } from '../types/escrow';
import { X, ShieldCheck, Loader2, Lock, Sparkles, AlertCircle, Key, Coins, FileCode } from 'lucide-react';

interface CreateEscrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: CreateEscrowRequest) => Promise<unknown>;
}

const SAMPLE_SELLER = 'mn_shielded_48a9b2c7e1f0d3a5b8c9e2f4a6b8d0c2e4f6a8b0';

export const CreateEscrowModal: React.FC<CreateEscrowModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { address } = useMidnightWallet();

  const [sellerAddress, setSellerAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('tDUST');
  const [condition, setCondition] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const buyer = address || 'mn_shielded_19f8a3c82d4e7b1a9c3e5d7f2a1b4c6e8d0f2a4b';

    if (!sellerAddress.trim()) {
      setValidationError('Please enter a valid counterparty / seller shielded address.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please enter a valid escrow amount greater than 0.');
      return;
    }

    if (!condition.trim() || condition.trim().length < 5) {
      setValidationError('Please define the condition or milestone requirement.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        buyerAddress: buyer,
        sellerAddress: sellerAddress.trim(),
        amount: amount.trim(),
        token,
        condition: condition.trim(),
      });
      setSellerAddress('');
      setAmount('');
      setCondition('');
      onClose();
    } catch (err: unknown) {
      setValidationError(err instanceof Error ? err.message : 'Deployment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const useSampleAddress = () => {
    setSellerAddress(SAMPLE_SELLER);
  };

  const modalContent = (
    <AnimatePresence>
      <div 
        className="modal-overlay" 
        onClick={onClose}
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="modal-content"
          style={{ maxWidth: '620px', padding: '2.4rem' }}
          onClick={(e) => e.stopPropagation()}
          data-lenis-prevent
        >
          {/* Top Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '1.8rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
              paddingBottom: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  background: 'rgba(194, 168, 120, 0.08)',
                  border: '1px solid rgba(194, 168, 120, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(194, 168, 120, 0.1)',
                }}
              >
                <Lock size={20} color="var(--accent-gold)" />
              </div>
              <div>
                <span className="section-label" style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
                  ZERO-KNOWLEDGE ESCROW
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '2rem',
                    fontStyle: 'italic',
                    letterSpacing: '-0.03em',
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                  }}
                >
                  Create Private Escrow<span style={{ color: 'var(--accent-gold)' }}>.</span>
                </h2>
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

          {/* Validation Error Alert */}
          {validationError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.85rem 1.1rem',
                borderRadius: '6px',
                background: 'rgba(255, 80, 80, 0.1)',
                border: '1px solid rgba(255, 80, 80, 0.3)',
                color: 'var(--accent-crimson)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                marginBottom: '1.4rem',
              }}
            >
              <AlertCircle size={15} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            {/* Seller Address Field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <label className="section-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Key size={11} color="var(--accent-gold)" />
                  <span>SELLER SHIELDED ADDRESS</span>
                </label>
                <button
                  type="button"
                  onClick={useSampleAddress}
                  style={{
                    background: 'rgba(194, 168, 120, 0.06)',
                    border: '1px solid rgba(194, 168, 120, 0.2)',
                    borderRadius: '9999px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--accent-gold)',
                    cursor: 'pointer',
                    padding: '2px 8px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(194, 168, 120, 0.15)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(194, 168, 120, 0.06)')}
                >
                  Use Sample Counterparty
                </button>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="mn_shielded_..."
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                disabled={isSubmitting}
                style={{ height: '42px', fontSize: '11px', letterSpacing: '0.04em' }}
              />
            </div>

            {/* Amount & Token Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '0.85rem' }}>
              <div>
                <label className="section-label" style={{ marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Coins size={11} color="var(--accent-gold)" />
                  <span>LOCKED AMOUNT</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                  style={{ height: '42px', fontSize: '12px', fontWeight: 500 }}
                />
              </div>

              <div>
                <label className="section-label" style={{ marginBottom: '0.45rem' }}>
                  TOKEN
                </label>
                <select
                  className="form-select"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isSubmitting}
                  style={{ height: '42px', fontSize: '11px' }}
                >
                  <option value="tDUST">tDUST (Midnight)</option>
                  <option value="DUST">DUST (Mainnet)</option>
                  <option value="USDC.m">USDC.m (Shielded)</option>
                </select>
              </div>
            </div>

            {/* Delivery Condition */}
            <div>
              <label className="section-label" style={{ marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <FileCode size={11} color="var(--accent-gold)" />
                <span>DELIVERY CONDITION / MILESTONE SPECIFICATION</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="Specify condition requirement (e.g. 'Deliver Phase 2 verification proof by Sept 30'). Condition text will be cryptographically hashed into zero-knowledge commitment."
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={isSubmitting}
                rows={3}
                style={{ fontSize: '11px', lineHeight: 1.6 }}
              />
            </div>

            {/* ZK Cryptographic Witness Box */}
            <div
              style={{
                padding: '1.1rem',
                background: 'rgba(194, 168, 120, 0.03)',
                border: '1px solid rgba(194, 168, 120, 0.16)',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: 'var(--accent-gold)',
                  marginBottom: '0.4rem',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                <ShieldCheck size={14} color="var(--accent-emerald)" />
                <span>Zero-Knowledge Witness Guarantee</span>
              </div>
              On-chain observers only see Pedersen commitments. The locked amount and condition text remain strictly private between buyer and seller until verified.
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.85rem',
                marginTop: '0.6rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                paddingTop: '1.25rem',
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
                style={{ padding: '0.75rem 1.4rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
                style={{ padding: '0.75rem 1.8rem', gap: '0.6rem' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Compiling ZK Witness & Deploying...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>Deploy Shielded Escrow</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
