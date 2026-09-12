import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { type CreateEscrowRequest } from '../types/escrow';
import { X, ShieldCheck, Loader2, Lock, Sparkles, AlertCircle } from 'lucide-react';

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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const buyer = address || 'mn_shielded_19f8a3c82d4e7b1a9c3e5d7f2a1b4c6e8d0f2a4b';

    if (!sellerAddress.trim()) {
      setValidationError('Please enter a recipient / seller shielded address.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setValidationError('Please specify a valid escrow amount greater than 0.');
      return;
    }

    if (!condition.trim() || condition.trim().length < 5) {
      setValidationError('Please define the condition or milestone to be delivered.');
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
      // Reset form on success
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

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="modal-content"
          style={{ maxWidth: '580px', padding: '2rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span className="section-label">Zero-Knowledge Escrow</span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.8rem',
                  fontStyle: 'italic',
                  letterSpacing: '-0.03em',
                  color: 'var(--text-primary)',
                  lineHeight: 1.1,
                }}
              >
                Create Private Escrow<span style={{ color: 'var(--accent-gold)' }}>.</span>
              </h2>
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
              <X size={18} />
            </button>
          </div>

          {/* Validation Error Alert */}
          {validationError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1rem',
                borderRadius: '6px',
                background: 'rgba(255, 80, 80, 0.1)',
                border: '1px solid rgba(255, 80, 80, 0.3)',
                color: 'var(--accent-crimson)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={14} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Seller Address */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="section-label" style={{ marginBottom: 0 }}>
                  Seller Shielded Address
                </label>
                <button
                  type="button"
                  onClick={useSampleAddress}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    color: 'var(--accent-gold)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0,
                  }}
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
              />
            </div>

            {/* Amount & Token */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="section-label">Locked Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="section-label">Token</label>
                <select
                  className="form-select"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="tDUST">tDUST (Midnight)</option>
                  <option value="DUST">DUST (Mainnet)</option>
                  <option value="USDC.m">USDC.m (Shielded)</option>
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="section-label">Delivery Condition / Milestone</label>
              <textarea
                className="form-textarea"
                placeholder="Specify condition requirement (e.g. 'Deliver Phase 2 verification proof by Sept 30'). Condition text will be cryptographically hashed into zero-knowledge commitment."
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            {/* ZK Cryptographic Privacy Box */}
            <div
              style={{
                padding: '0.9rem',
                background: 'rgba(194, 168, 120, 0.03)',
                border: '1px solid rgba(194, 168, 120, 0.15)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', marginBottom: '0.3rem' }}>
                <Lock size={12} />
                <span style={{ fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Zero-Knowledge Witness Guarantee
                </span>
              </div>
              On-chain observers only see Pedersen commitments. The locked amount and condition text remain strictly private between buyer and seller until verified.
            </div>

            {/* Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '0.5rem',
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
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
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
};
