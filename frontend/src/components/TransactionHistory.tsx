import React, { useState } from 'react';
import { EscrowTransaction } from '../types/escrow';
import { ExternalLink, Copy, Check, Clock } from 'lucide-react';

interface TransactionHistoryProps {
  transactions: EscrowTransaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div
        style={{
          padding: '1.5rem',
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          background: 'rgba(255, 255, 255, 0.01)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
        }}
      >
        No on-chain state transitions recorded yet for this escrow.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%' }}>
      {transactions.map((tx) => {
        const shortHash = `${tx.hash.slice(0, 10)}...${tx.hash.slice(-6)}`;
        const dateStr = new Date(tx.timestamp).toLocaleString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        return (
          <div
            key={tx.hash}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 0.9rem',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              transition: 'all 0.2s ease',
            }}
          >
            {/* Left: Type + Hash */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span
                style={{
                  fontSize: '9px',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background: 'rgba(194, 168, 120, 0.08)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(194, 168, 120, 0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                }}
              >
                {tx.type}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: 'var(--text-primary)', letterSpacing: '0.05em' }}>{shortHash}</span>
                <button
                  type="button"
                  onClick={() => copyHash(tx.hash)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                  title="Copy transaction hash"
                >
                  {copiedHash === tx.hash ? (
                    <Check size={11} color="var(--accent-emerald)" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
              </div>
            </div>

            {/* Right: Block & Timestamp */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
              <span>Block #{tx.blockHeight}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={10} />
                <span>{dateStr}</span>
              </div>
              <a
                href={`https://explorer.preprod.midnight.network/tx/${tx.hash}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: 'var(--accent-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                }}
                title="View on Midnight Preprod Explorer"
              >
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
};
