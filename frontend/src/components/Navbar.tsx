import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { Magnetic } from './Magnetic';
import { Loader2, Copy, Check, LogOut, ChevronDown, Menu, X, Shield, ShieldCheck, Activity, Info } from 'lucide-react';

export type ActiveNavView = 'escrows' | 'stats' | 'explorer' | 'about';

interface NavbarProps {
  activeView: ActiveNavView;
  setActiveView: (view: ActiveNavView) => void;
  onCreateClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
}) => {
  const { isConnected, isConnecting, address, shortAddress, connect, disconnect } = useMidnightWallet();
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const copyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavClick = (view: ActiveNavView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className="floating-nav"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="nav-pill">
        {/* Brand */}
        <div
          className="nav-brand"
          onClick={() => handleNavClick('escrows')}
        >
          <span>Haven</span>
          <span style={{ color: 'var(--accent-gold)' }}>.</span>
        </div>

        {/* Desktop Nav Links with active gold dot indicator */}
        <div className="nav-links">
          <button
            type="button"
            className={`nav-link-btn ${activeView === 'escrows' ? 'active' : ''}`}
            onClick={() => handleNavClick('escrows')}
          >
            <span>ESCROWS</span>
            {activeView === 'escrows' && (
              <motion.div
                layoutId="navDot"
                className="nav-active-dot"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeView === 'stats' ? 'active' : ''}`}
            onClick={() => handleNavClick('stats')}
          >
            <span>STATS</span>
            {activeView === 'stats' && (
              <motion.div
                layoutId="navDot"
                className="nav-active-dot"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeView === 'explorer' ? 'active' : ''}`}
            onClick={() => handleNavClick('explorer')}
          >
            <span>EXPLORER</span>
            {activeView === 'explorer' && (
              <motion.div
                layoutId="navDot"
                className="nav-active-dot"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>

          <button
            type="button"
            className={`nav-link-btn ${activeView === 'about' ? 'active' : ''}`}
            onClick={() => handleNavClick('about')}
          >
            <span>ABOUT</span>
            {activeView === 'about' && (
              <motion.div
                layoutId="navDot"
                className="nav-active-dot"
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </button>
        </div>

        {/* Right Area: SYS.ONLINE + Wallet + Mobile Toggle */}
        <div className="nav-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
          {/* Status Indicator (hidden on small mobile) */}
          <div
            className="status-indicator-badge"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              color: 'rgba(240, 240, 240, 0.45)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                boxShadow: '0 0 6px var(--accent-emerald)',
              }}
            />
            <span className="sys-status-text">SYS.ONLINE</span>
          </div>

          {/* Connect / Connected Button (Desktop & Mobile Pill) */}
          <div className="desktop-wallet-pill">
            {!isConnected ? (
              <Magnetic strength={0.25}>
                <button
                  type="button"
                  className="btn-pill-connect"
                  onClick={() => connect()}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>CONNECTING</span>
                    </>
                  ) : (
                    <span>CONNECT LACE</span>
                  )}
                </button>
              </Magnetic>
            ) : (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="btn-pill-connect"
                  style={{
                    color: 'var(--text-primary)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      background: 'var(--accent-emerald)',
                      boxShadow: '0 0 6px var(--accent-emerald)',
                    }}
                  />
                  <span style={{ letterSpacing: '0.08em' }}>{shortAddress}</span>
                  <ChevronDown size={10} color="var(--text-muted)" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 'calc(100% + 8px)',
                        width: '210px',
                        background: 'rgba(14, 12, 18, 0.96)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '6px',
                        padding: '0.5rem',
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.9)',
                        zIndex: 200,
                      }}
                    >
                      <div
                        style={{
                          padding: '0.35rem 0.5rem',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                          marginBottom: '0.35rem',
                        }}
                      >
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '8px',
                            color: 'var(--text-muted)',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Midnight Preprod
                        </div>
                        <div
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '10px',
                            color: 'var(--accent-gold)',
                            marginTop: '2px',
                          }}
                        >
                          Shielded Key Active
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
                          padding: '0.45rem 0.5rem',
                          background: 'none',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'var(--text-primary)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <span>Copy Address</span>
                        {copied ? <Check size={11} color="var(--accent-emerald)" /> : <Copy size={11} />}
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
                          padding: '0.45rem 0.5rem',
                          background: 'none',
                          border: 'none',
                          borderRadius: '4px',
                          color: 'var(--accent-crimson)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '9px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em',
                          cursor: 'pointer',
                          textAlign: 'left',
                          marginTop: '2px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 80, 80, 0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                      >
                        <span>Disconnect</span>
                        <LogOut size={11} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Overlay Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mobile-menu-drawer glass-card"
          >
            {/* Nav Links List */}
            <div className="mobile-menu-links">
              <button
                type="button"
                className={`mobile-menu-item ${activeView === 'escrows' ? 'active' : ''}`}
                onClick={() => handleNavClick('escrows')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Shield size={14} color={activeView === 'escrows' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  <span>ESCROWS</span>
                </div>
                {activeView === 'escrows' && <span className="mobile-active-pip" />}
              </button>

              <button
                type="button"
                className={`mobile-menu-item ${activeView === 'stats' ? 'active' : ''}`}
                onClick={() => handleNavClick('stats')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Activity size={14} color={activeView === 'stats' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  <span>STATS</span>
                </div>
                {activeView === 'stats' && <span className="mobile-active-pip" />}
              </button>

              <button
                type="button"
                className={`mobile-menu-item ${activeView === 'explorer' ? 'active' : ''}`}
                onClick={() => handleNavClick('explorer')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShieldCheck size={14} color={activeView === 'explorer' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  <span>EXPLORER</span>
                </div>
                {activeView === 'explorer' && <span className="mobile-active-pip" />}
              </button>

              <button
                type="button"
                className={`mobile-menu-item ${activeView === 'about' ? 'active' : ''}`}
                onClick={() => handleNavClick('about')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Info size={14} color={activeView === 'about' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  <span>ABOUT HAVEN</span>
                </div>
                {activeView === 'about' && <span className="mobile-active-pip" />}
              </button>
            </div>

            {/* Mobile Wallet & Status Bar */}
            <div className="mobile-menu-footer">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  marginBottom: '0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'var(--text-muted)',
                  }}
                >
                  Network Status
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    color: 'var(--accent-emerald)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                  MIDNIGHT PREPROD
                </span>
              </div>

              {!isConnected ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    connect();
                    setMobileMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  style={{ width: '100%', justifyContent: 'center', padding: '0.65rem' }}
                >
                  {isConnecting ? 'CONNECTING...' : 'CONNECT LACE WALLET'}
                </button>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '6px',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--accent-gold)' }}>
                      {shortAddress}
                    </span>
                    <button
                      type="button"
                      onClick={copyAddress}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {copied ? <Check size={12} color="var(--accent-emerald)" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      disconnect();
                      setMobileMenuOpen(false);
                    }}
                    style={{ color: 'var(--accent-crimson)', width: '100%', justifyContent: 'center' }}
                  >
                    DISCONNECT
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

