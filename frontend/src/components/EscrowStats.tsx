import React from 'react';
import { EscrowRecord, EscrowState } from '../types/escrow';
import { Lock, Activity, ShieldAlert, Coins } from 'lucide-react';
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

  // TVL Calculation (parse numbers)
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
      subtext: 'ZK Verified',
      icon: <Lock size={15} color="var(--accent-gold)" />,
      accentColor: 'var(--accent-gold)',
      glow: 'rgba(194, 168, 120, 0.08)',
    },
    {
      label: 'ACTIVE ESCROWS',
      value: activeCount.toString(),
      subtext: 'In Progress',
      icon: <Activity size={15} color="var(--accent-emerald)" />,
      accentColor: 'var(--accent-emerald)',
      glow: 'rgba(52, 211, 153, 0.08)',
    },
    {
      label: 'TOTAL VALUE LOCKED',
      value: `${tvl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: 'tDUST Shielded',
      icon: <Coins size={15} color="var(--accent-gold)" />,
      accentColor: 'var(--accent-gold)',
      glow: 'rgba(194, 168, 120, 0.08)',
    },
    {
      label: 'ACTIVE DISPUTES',
      value: disputesCount.toString(),
      subtext: disputesCount === 0 ? '0.00% Rate' : 'Arbitration Pending',
      icon: <ShieldAlert size={15} color={disputesCount > 0 ? 'var(--accent-crimson)' : 'var(--text-muted)'} />,
      accentColor: disputesCount > 0 ? 'var(--accent-crimson)' : 'var(--text-muted)',
      glow: disputesCount > 0 ? 'rgba(255, 80, 80, 0.08)' : 'transparent',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        width: '100%',
        marginBottom: '2.5rem',
      }}
    >
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="glass-card"
          style={{
            padding: '1.25rem 1.4rem',
            background: `radial-gradient(circle at top right, ${stat.glow} 0%, rgba(255, 255, 255, 0.015) 100%)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
            }}
          >
            <span className="section-label" style={{ color: stat.accentColor, marginBottom: 0 }}>
              {stat.label}
            </span>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {stat.icon}
            </div>
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '1.75rem',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              lineHeight: 1.1,
            }}
          >
            {stat.value}
          </div>

          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              marginTop: '0.4rem',
            }}
          >
            {stat.subtext}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
