import React from 'react';
import { EscrowRecord, EscrowState } from '../types/escrow';
import { PrivacyToggle } from './PrivacyToggle';
import { StateTimeline } from './StateTimeline';
import { ArrowUpRight, Clock, ShieldCheck, Lock, FileText, ArrowRight, UserCheck } from 'lucide-react';
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

  const getStatusColor = () => {
    switch (escrow.state) {
      case EscrowState.Funded:
      case EscrowState.Released:
        return 'var(--accent-emerald)';
      case EscrowState.Delivered:
        return '#a78bfa';
      case EscrowState.Disputed:
        return 'var(--accent-crimson)';
      default:
        return 'var(--accent-gold)';
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
        padding: '1.6rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1.3rem',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Ambient background watermark */}
      <div
        style={{
          position: 'absolute',
          top: '-15px',
          right: '-15px',
          opacity: 0.03,
          pointerEvents: 'none',
        }}
      >
        <ShieldCheck size={140} color="var(--accent-gold)" />
      </div>

      {/* Top Header: ID + State Badge + Timeline */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '0.08em',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              {shortId}
            </span>

            <span className={getStateBadgeClass()}>
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  background: getStatusColor(),
                  boxShadow: `0 0 6px ${getStatusColor()}`,
                }}
              />
              <span>{escrow.stateLabel}</span>
            </span>
          </div>

          <StateTimeline state={escrow.state} compact />
        </div>

        {/* Counterparties Flow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            color: 'var(--text-muted)',
            letterSpacing: '0.08em',
            background: 'rgba(255, 255, 255, 0.015)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        >
          <span>{escrow.buyerAddress.slice(0, 10)}...</span>
          <ArrowRight size={10} color="var(--accent-gold)" />
          <span>{escrow.sellerAddress.slice(0, 10)}...</span>
        </div>
      </div>

      {/* Middle Section: Amount + Condition */}
      <div>
        {/* Amount Box */}
        <div
          style={{
            padding: '0.85rem 1rem',
            background: 'rgba(194, 168, 120, 0.03)',
            border: '1px solid rgba(194, 168, 120, 0.12)',
            borderRadius: '6px',
            marginBottom: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span className="section-label" style={{ marginBottom: 0, fontSize: '8.5px' }}>
              LOCKED SHIELDED VALUE
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8.5px', color: 'var(--accent-gold)', letterSpacing: '0.1em' }}>
              ZK PEDERSEN
            </span>
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.4rem',
              fontWeight: 500,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
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

        {/* Condition Box */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <FileText size={10} color="var(--text-muted)" />
            <span className="section-label" style={{ marginBottom: 0, fontSize: '8.5px', color: 'var(--text-muted)' }}>
              CONDITION / MILESTONE
            </span>
          </div>
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
              background: 'rgba(255, 255, 255, 0.015)',
              padding: '8px 10px',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            "{escrow.condition}"
          </p>
        </div>
      </div>

      {/* Bottom Bar: Timestamp + Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '0.9rem',
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
          <Clock size={11} />
          <span>{dateFormatted}</span>
        </div>

        {/* Action Button based on state */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {escrow.state === EscrowState.Created && (
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '9px' }}
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
                padding: '0.4rem 0.85rem',
                fontSize: '9px',
                borderColor: 'rgba(139, 92, 246, 0.4)',
                color: '#a78bfa',
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
              style={{ padding: '0.4rem 0.85rem', fontSize: '9px' }}
              onClick={(e) => onActionClick(e, 'release', escrow)}
            >
              <span>RELEASE</span>
            </button>
          )}

          <button
            type="button"
            className="btn-ghost"
            style={{ padding: '0.35rem 0.6rem', fontSize: '9.5px', color: 'var(--accent-gold)' }}
            onClick={() => onSelect(escrow.id)}
          >
            <span>DETAILS</span>
            <ArrowUpRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
