import React, { useState } from 'react';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { Shield, Loader2, Copy, Check, LogOut, ChevronDown } from 'lucide-react';
import { Magnetic } from './Magnetic';
import { motion, AnimatePresence } from 'framer-motion';

export const WalletStatus: React.FC = () => {
  const { isConnected, isConnecting, shortAddress, address, connect, disconnect, isDemoMode } =
    useMidnightWallet();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnecting) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'var(--accent-gold)',
          padding: '0.45rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(194, 168, 120, 0.08)',
          border: '1px solid rgba(194, 168, 120, 0.25)',
        }}
      >
        <Loader2 size={12} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
        <span>Connecting...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <Magnetic strength={0.25}>
        <button
          type="button"
          onClick={() => connect()}
          className="btn-primary"
          style={{
            padding: '0.45rem 1.1rem',
            fontSize: '10px',
            borderRadius: '9999px',
          }}
        >
          <Shield size={12} />
          <span>Connect Lace</span>
        </button>
      </Magnetic>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-subtle)',
          padding: '0.4rem 0.8rem',
          borderRadius: '9999px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-primary)',
          transition: 'border-color 0.2s ease, background 0.2s ease',
        }}
      >
        {/* Pulsing Emerald Dot */}
        <span
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '8px',
            height: '8px',
          }}
        >
          <span
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
              opacity: 0.75,
              animation: 'pulseGlow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            }}
          />
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--accent-emerald)',
            }}
          />
        </span>

        <span style={{ letterSpacing: '0.05em' }}>{shortAddress}</span>

        <span
          style={{
            fontSize: '8px',
            padding: '1px 5px',
            borderRadius: '4px',
            background: 'rgba(52, 211, 153, 0.1)',
            color: 'var(--accent-emerald)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            letterSpacing: '0.1em',
          }}
        >
          SYS.ONLINE
        </span>

        <ChevronDown size={11} color="var(--text-muted)" />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: '220px',
              background: 'rgba(12, 12, 18, 0.95)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.5rem',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              zIndex: 200,
            }}
          >
            <div
              style={{
                padding: '0.4rem 0.6rem',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: '0.4rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Connected Network
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--accent-gold)',
                  fontWeight: 500,
                  marginTop: '2px',
                }}
              >
                Midnight Preprod
              </div>
            </div>

            <button
              type="button"
              onClick={copyAddress}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.6rem',
                background: 'none',
                border: 'none',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span>Copy Shielded Address</span>
              {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
            </button>

            <button
              type="button"
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.6rem',
                background: 'none',
                border: 'none',
                borderRadius: '4px',
                color: 'var(--accent-crimson)',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                marginTop: '2px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 80, 80, 0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              <span>Disconnect</span>
              <LogOut size={12} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
