import React from 'react';
import { EscrowRecord, EscrowState } from '../types/escrow';
import { ShieldCheck, Activity, ShieldAlert, Coins, Lock, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface EscrowStatsProps {
  escrows: EscrowRecord[];
}

export const EscrowStats: React.FC<EscrowStatsProps> = ({ escrows }) => {
  const totalCount = escrows.length;

  const activeCount = escrows.filter(
    (e) =>
      e.state === EscrowState.Created ||
      e.state === EscrowState.Funded ||
      e.state === EscrowState.Delivered
  ).length;

  const disputesCount = escrows.filter((e) => e.state === EscrowState.Disputed).length;

  // TVL Calculation
  const tvl = escrows
    .filter(
      (e) =>
        e.state === EscrowState.Funded ||
        e.state === EscrowState.Delivered ||
        e.state === EscrowState.Disputed
    )
    .reduce((acc, curr) => {
      const cleanNum = parseFloat(curr.amount.replace(/,/g, '')) || 0;
      return acc + cleanNum;
    }, 0);

  const stats = [
    {
      label: 'TOTAL ESCROWS',
      value: totalCount.toString(),
      subtext: '90 ZK Tests Verified',
      icon: <Lock size={16} color="var(--accent-gold)" />,
      badge: 'ON-CHAIN',
      accentColor: 'var(--accent-gold)',
      glowColor: 'rgba(194, 168, 120, 0.15)',
      borderColor: 'rgba(194, 168, 120, 0.25)',
    },
    {
      label: 'ACTIVE ESCROWS',
      value: activeCount.toString(),
      subtext: `${activeCount} In Execution`,
      icon: <Activity size={16} color="var(--accent-emerald)" />,
      badge: 'LIVE',
      accentColor: 'var(--accent-emerald)',
      glowColor: 'rgba(52, 211, 153, 0.15)',
      borderColor: 'rgba(52, 211, 153, 0.25)',
    },
    {
      label: 'TOTAL VALUE LOCKED',
      value: `${tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: 'tDUST Shielded',
      icon: <Coins size={16} color="var(--accent-gold)" />,
      badge: 'SHIELDED',
      accentColor: 'var(--accent-gold)',
      glowColor: 'rgba(194, 168, 120, 0.15)',
      borderColor: 'rgba(194, 168, 120, 0.25)',
    },
    {
      label: 'ACTIVE DISPUTES',
      value: disputesCount.toString(),
      subtext: disputesCount === 0 ? '0.00% Dispute Rate' : 'Arbitration Pending',
      icon: <ShieldAlert size={16} color={disputesCount > 0 ? 'var(--accent-crimson)' : 'rgba(255, 255, 255, 0.4)'} />,
      badge: disputesCount > 0 ? 'ATTN' : 'HEALTHY',
      accentColor: disputesCount > 0 ? 'var(--accent-crimson)' : 'var(--accent-emerald)',
      glowColor: disputesCount > 0 ? 'rgba(255, 80, 80, 0.15)' : 'rgba(52, 211, 153, 0.08)',
      borderColor: disputesCount > 0 ? 'rgba(255, 80, 80, 0.3)' : 'rgba(255, 255, 255, 0.08)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        width: '100%',
        marginBottom: '2.5rem',
      }}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            padding: '1.4rem 1.6rem',
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${stat.borderColor}`,
            background: `
              radial-gradient(
                400px circle at 90% 10%, 
                ${stat.glowColor},
                transparent 60%
              ),
              rgba(18, 16, 22, 0.5)
            `,
          }}
        >
          {/* Top Row: Label + Icon + Mini Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
                {stat.icon}
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9.5px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.18em',
                  color: 'var(--text-muted)',
                }}
              >
                {stat.label}
              </span>
            </div>

            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '8px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                padding: '2px 7px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: stat.accentColor,
              }}
            >
              {stat.badge}
            </span>
          </div>

          {/* Metric Value */}
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '2.1rem',
              fontWeight: 500,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1,
              marginBottom: '0.45rem',
            }}
          >
            {stat.value}
          </div>

          {/* Subtext */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '9.5px',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--text-muted)',
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: stat.accentColor,
                boxShadow: `0 0 6px ${stat.accentColor}`,
                display: 'inline-block',
              }}
            />
            <span>{stat.subtext}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
