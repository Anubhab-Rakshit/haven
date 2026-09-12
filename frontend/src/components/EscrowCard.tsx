import React from 'react';
import { EscrowRecord, EscrowState } from '../types/escrow';
import { PrivacyToggle } from './PrivacyToggle';
import { StateTimeline } from './StateTimeline';
import { ArrowUpRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface EscrowCardProps {
  escrow: EscrowRecord;
  onSelect: (escrowId: string) => void;
  onActionClick: (e: React.MouseEvent, actionType: 'deposit' | 'confirmDelivery' | 'release' | 'dispute', escrow: EscrowRecord) => void;
}

export const EscrowCard: React.FC<EscrowCardProps> = ({
  escrow,
  onSelect,
  onActionClick,
}) => {
  const shortId = `#${escrow.id.slice(7, 15)}`;
  const dateFormatted = new Date(escrow.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const getStateBadgeClass = () => {
    switch (escrow.state) {
      case EscrowState.Created:
        return 'badge-state created';
      case EscrowState.Funded:
        return 'badge-state funded';
      case EscrowState.Delivered:
        return 'badge-state delivered';
      case EscrowState.Released:
        return 'badge-state released';
      case EscrowState.Disputed:
        return 'badge-state disputed';
      case EscrowState.Resolved:
        return 'badge-state resolved';
      case EscrowState.Cancelled:
        return 'badge-state cancelled';
      default:
        return 'badge-state';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card glass-card-interactive"
      onClick={() => onSelect(escrow.id)}
      style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.25rem',
      }}
    >
      {/* Top Bar: ID + State Badge + Mini Timeline */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '0.08em',
            }}
          >
            {shortId}
          </span>

          <span className={getStateBadgeClass()}>
            {escrow.state === EscrowState.Funded && (
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: 'var(--accent-emerald)',
                }}
              />
            )}
            {escrow.stateLabel}
          </span>
        </div>

        <StateTimeline state={escrow.state} compact />
      </div>

      {/* Main Content: Amount + Condition */}
      <div>
        {/* Amount Row */}
        <div style={{ marginBottom: '0.8rem' }}>
          <span className="section-label" style={{ marginBottom: '2px', fontSize: '8.5px' }}>
            LOCKED VALUE
          </span>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.3rem',
              fontWeight: 400,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}
          >
            <PrivacyToggle
              value={escrow.amount}
              suffix={escrow.token || 'tDUST'}
              storageKey={escrow.id}
            />
          </div>
        </div>

        {/* Condition Text */}
        <div>
          <span className="section-label" style={{ marginBottom: '2px', fontSize: '8.5px', color: 'var(--text-muted)' }}>
            CONDITION
          </span>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 300,
              lineHeight: 1.55,
              color: 'var(--text-muted)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {escrow.condition}
          </p>
        </div>
      </div>

      {/* Bottom Bar: Created Date + Action Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '0.85rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          <Clock size={10} />
          <span>{dateFormatted}</span>
        </div>

        {/* Action Button based on state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {escrow.state === EscrowState.Created && (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '9px' }}
              onClick={(e) => onActionClick(e, 'deposit', escrow)}
            >
              <span>DEPOSIT</span>
            </button>
          )}

          {escrow.state === EscrowState.Funded && (
            <button
              type="button"
              className="btn-secondary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '9px',
                borderColor: 'rgba(139, 92, 246, 0.4)',
                color: 'var(--accent-violet)',
              }}
              onClick={(e) => onActionClick(e, 'confirmDelivery', escrow)}
            >
              <span>DELIVER</span>
            </button>
          )}

          {escrow.state === EscrowState.Delivered && (
            <button
              type="button"
              className="btn-emerald"
              style={{ padding: '0.35rem 0.75rem', fontSize: '9px' }}
              onClick={(e) => onActionClick(e, 'release', escrow)}
            >
              <span>RELEASE</span>
            </button>
          )}

          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '0.3rem 0.5rem', fontSize: '9px' }}
            onClick={() => onSelect(escrow.id)}
          >
            <span>DETAILS</span>
            <ArrowUpRight size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
