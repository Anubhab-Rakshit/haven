import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Code2, ShieldCheck, Cpu, ArrowRight, Sparkles } from 'lucide-react';

export const ZKExplorerView: React.FC = () => {
  const [testInput, setTestInput] = useState('Deliver 10 units of software license by October 15');
  const [amountInput, setAmountInput] = useState('500');

  // Simulated Pedersen commitment hashing
  const generateSimulatedCommitment = (val: string, prefix: string) => {
    let hash = 0;
    for (let i = 0; i < val.length; i++) {
      hash = (hash << 5) - hash + val.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `${prefix}_${hex}e94f810a9c2b3d4e`;
  };

  const conditionCommitment = generateSimulatedCommitment(testInput, 'cm_cnd');
  const amountCommitment = generateSimulatedCommitment(amountInput, 'cm_amt');

  return (
    <div className="haven-container" style={{ paddingBottom: '5rem', paddingTop: '1rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-label">Zero-Knowledge Cryptography</span>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '3rem',
              fontStyle: 'italic',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginBottom: '0.6rem',
            }}
          >
            Compact Circuit & Commitment Explorer<span style={{ color: 'var(--accent-gold)' }}>.</span>
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--text-muted)',
              maxWidth: '520px',
              margin: '0 auto',
            }}
          >
            Inspect the underlying Compact smart contract circuits, witness generators, and Pedersen commitments that power Haven.
          </p>
        </div>

        {/* Live Commitment Generator Sandbox */}
        <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Sparkles size={16} color="var(--accent-gold)" />
            <span className="section-label" style={{ marginBottom: 0 }}>
              INTERACTIVE PEDERSEN COMMITMENT LAB
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Input Controls */}
            <div>
              <label className="section-label">Private Condition Witness (Plaintext)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />

              <label className="section-label">Private Escrow Amount</label>
              <input
                type="number"
                className="form-input"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
              />
            </div>

            {/* Output Commitments */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                  On-Chain Condition Commitment (Hashed)
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {conditionCommitment}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', textTransform: 'uppercase', color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  On-Chain Amount Commitment (Hashed)
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {amountCommitment}
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <ShieldCheck size={13} color="var(--accent-emerald)" />
                <span>Zero information is leaked to public validators or block explorers.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Circuit Reference */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Code2 size={16} color="var(--accent-violet)" />
            <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-violet)' }}>
              COMPACT SMART CONTRACT SOURCE (contracts/escrow.compact)
            </span>
          </div>

          <pre
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '1.25rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              overflowX: 'auto',
            }}
          >
{`// Compact ZK Circuit for Haven Private Escrow
pragma language_version >= 0.16.0;

export ledger buyer_commitment: Bytes<32>;
export ledger seller_commitment: Bytes<32>;
export ledger amount_commitment: Bytes<32>;
export ledger condition_commitment: Bytes<32>;
export ledger escrow_state: Uint<8>;

// State Machine Circuits
export circuit deposit(witness b_secret: Bytes<32>): Void {
    assert escrow_state == 0;
    assert pedersen_hash(b_secret) == buyer_commitment;
    escrow_state = 1; // Funded
}

export circuit confirm_delivery(witness s_secret: Bytes<32>, witness condition: Bytes<32>): Void {
    assert escrow_state == 1;
    assert pedersen_hash(condition) == condition_commitment;
    escrow_state = 2; // Delivered
}

export circuit release_funds(witness b_secret: Bytes<32>): Void {
    assert escrow_state == 2;
    assert pedersen_hash(b_secret) == buyer_commitment;
    escrow_state = 3; // Released (Terminal)
}`}
          </pre>
        </div>
      </motion.div>
    </div>
  );
};
