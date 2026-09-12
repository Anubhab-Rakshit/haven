import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PrivacyToggleProps {
  value: string;
  storageKey?: string;
  mask?: string;
  suffix?: string;
  className?: string;
  mono?: boolean;
}

export const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  value,
  storageKey,
  mask = '••••••••',
  suffix = '',
  className = '',
  mono = true,
}) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(() => {
    if (!storageKey) return false;
    return localStorage.getItem(`haven_privacy_${storageKey}`) === 'true';
  });

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRevealed((prev) => {
      const next = !prev;
      if (storageKey) {
        localStorage.setItem(`haven_privacy_${storageKey}`, String(next));
      }
      return next;
    });
  };

  return (
    <span
      className={`inline-flex items-center gap-2 ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isRevealed ? 'revealed' : 'masked'}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.2 }}
          style={{
            fontFamily: mono ? 'var(--font-mono)' : 'inherit',
            letterSpacing: isRevealed ? 'normal' : '0.15em',
            color: isRevealed ? 'var(--text-primary)' : 'var(--text-muted)',
          }}
        >
          {isRevealed ? `${value} ${suffix}`.trim() : mask}
        </motion.span>
      </AnimatePresence>

      <button
        type="button"
        onClick={toggle}
        title={isRevealed ? 'Hide confidential data' : 'Reveal private ZK field'}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px',
          cursor: 'pointer',
          color: isRevealed ? 'var(--accent-gold)' : 'var(--text-muted)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s ease, transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-gold)')}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = isRevealed ? 'var(--accent-gold)' : 'var(--text-muted)')
        }
      >
        {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
      </button>
    </span>
  );
};
