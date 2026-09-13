import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { EscrowRecord, EscrowState } from '../types/escrow';
import { useMidnightWallet } from '../context/MidnightWalletContext';
import { useEscrowService } from '../hooks/useEscrowService';
import { EscrowStats } from './EscrowStats';
import { EscrowCard } from './EscrowCard';
import { CreateEscrowModal } from './CreateEscrowModal';
import { EscrowDetailModal } from './EscrowDetailModal';
import { ActionModal, ActionType } from './ActionModal';
import { Magnetic } from './Magnetic';
import {
  Plus,
  Search,
  RefreshCw,
  Sparkles,
  Inbox,
  RotateCcw,
} from 'lucide-react';

type FilterTab = 'all' | 'active' | 'funded' | 'delivered' | 'disputed' | 'completed';

export const EscrowBoard: React.FC = () => {
  const { isConnected, connect, isConnecting, error, availableWallets } = useMidnightWallet();
  const {
    escrows,
    selectedEscrow,
    isLoading,
    transactions,
    createEscrow,
    deposit,
    confirmDelivery,
    release,
    dispute,
    resolve,
    cancel,
    selectEscrow,
    clearSelection,
    refresh,
    resetToDefaults,
  } = useEscrowService();

  // Modals & Action States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActionModal, setActiveActionModal] = useState<{
    type: ActionType;
    escrow: EscrowRecord;
  } | null>(null);

  // Filters & Search
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered List
  const filteredEscrows = useMemo(() => {
    return escrows.filter((escrow) => {
      // Tab matching
      if (activeTab === 'active') {
        if (
          escrow.state !== EscrowState.Created &&
          escrow.state !== EscrowState.Funded &&
          escrow.state !== EscrowState.Delivered
        ) {
          return false;
        }
      } else if (activeTab === 'funded') {
        if (escrow.state !== EscrowState.Funded) return false;
      } else if (activeTab === 'delivered') {
        if (escrow.state !== EscrowState.Delivered) return false;
      } else if (activeTab === 'disputed') {
        if (escrow.state !== EscrowState.Disputed) return false;
      } else if (activeTab === 'completed') {
        if (
          escrow.state !== EscrowState.Released &&
          escrow.state !== EscrowState.Resolved &&
          escrow.state !== EscrowState.Cancelled
        ) {
          return false;
        }
      }

      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = escrow.id.toLowerCase().includes(q);
        const matchesContract = escrow.contractAddress.toLowerCase().includes(q);
        const matchesCondition = escrow.condition.toLowerCase().includes(q);
        const matchesState = escrow.stateLabel.toLowerCase().includes(q);
        if (!matchesId && !matchesContract && !matchesCondition && !matchesState) {
          return false;
        }
      }

      return true;
    });
  }, [escrows, activeTab, searchQuery]);

  const handleCardAction = (
    e: React.MouseEvent,
    actionType: ActionType,
    escrow: EscrowRecord
  ) => {
    e.stopPropagation();
    setActiveActionModal({ type: actionType, escrow });
  };

  const executeAction = async () => {
    if (!activeActionModal) return;
    const { type, escrow } = activeActionModal;

    switch (type) {
      case 'deposit':
        await deposit(escrow.id, escrow.amount);
        break;
      case 'confirmDelivery':
        await confirmDelivery(escrow.id);
        break;
      case 'release':
        await release(escrow.id);
        break;
      case 'dispute':
        await dispute(escrow.id);
        break;
      case 'resolve':
        await resolve(escrow.id);
        break;
      case 'cancel':
        await cancel(escrow.id);
        break;
    }
  };

  return (
    <div className="haven-container" style={{ paddingBottom: '6rem' }}>
      {/* If Not Connected -> Render the pure, luxury Awwwards hero matching the screenshot */}
      {!isConnected ? (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          style={{
            minHeight: '65vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem 1rem',
          }}
        >
          <h1 className="hero-title">Create an Escrow</h1>

          <p className="hero-subtitle">
            Connect your Midnight wallet to create or verify private escrows.
          </p>

          {/* Error banner */}
          {error && (
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                background: 'rgba(255, 80, 80, 0.08)',
                border: '1px solid rgba(255, 80, 80, 0.25)',
                color: '#ff6b6b',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                marginBottom: '1rem',
                maxWidth: '480px',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}

          {/* Wallet selector or connect button */}
          {availableWallets.length > 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color: 'var(--text-muted)',
                }}
              >
                Select a wallet
              </p>
              {availableWallets.map((wallet) => (
                <Magnetic key={wallet.id} strength={0.3}>
                  <button
                    type="button"
                    className="btn-outline-gold"
                    onClick={() => connect(wallet.id)}
                    disabled={isConnecting}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
                  >
                    {wallet.icon && (
                      <img src={wallet.icon} alt="" style={{ width: 20, height: 20, borderRadius: 4 }} />
                    )}
                    <span>{isConnecting ? 'CONNECTING...' : `CONNECT ${wallet.name.toUpperCase()}`}</span>
                  </button>
                </Magnetic>
              ))}
            </div>
          ) : (
            <Magnetic strength={0.3}>
              <button
                type="button"
                className="btn-outline-gold"
                onClick={() => connect()}
                disabled={isConnecting}
              >
                <span>{isConnecting ? 'CONNECTING WALLET...' : 'CONNECT WALLET'}</span>
              </button>
            </Magnetic>
          )}
        </motion.div>
      ) : (
        /* Connected View */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle Top Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem', paddingTop: '0.5rem' }}>
            <span className="section-label">MIDNIGHT NETWORK • ZERO-KNOWLEDGE ESCROW</span>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
                fontStyle: 'italic',
                fontWeight: 400,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                marginTop: '0.3rem',
                marginBottom: '0.6rem',
              }}
            >
              Private Escrows & Settlement<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                color: 'var(--text-muted)',
                maxWidth: '540px',
                margin: '0 auto',
              }}
            >
              Shielded conditional execution with Pedersen witness verification.
            </p>
          </div>

          {/* Stats Row */}
          <EscrowStats escrows={escrows} />

          {/* Control Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            {/* Tabs */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                background: 'rgba(18, 16, 22, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.07)',
                padding: '0.25rem',
                borderRadius: '6px',
                backdropFilter: 'blur(20px)',
              }}
            >
              {(
                [
                  { key: 'all', label: 'ALL' },
                  { key: 'active', label: 'ACTIVE' },
                  { key: 'funded', label: 'FUNDED' },
                  { key: 'delivered', label: 'DELIVERED' },
                  { key: 'disputed', label: 'DISPUTED' },
                  { key: 'completed', label: 'COMPLETED' },
                ] as { key: FilterTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    background: activeTab === tab.key ? 'rgba(194, 168, 120, 0.12)' : 'transparent',
                    border: activeTab === tab.key ? '1px solid rgba(194, 168, 120, 0.3)' : '1px solid transparent',
                    color: activeTab === tab.key ? 'var(--accent-gold)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Actions: Search, Refresh, New */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Search */}
              <div style={{ position: 'relative', width: '200px' }}>
                <Search
                  size={12}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="FILTER ESCROWS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '1.9rem', height: '32px', fontSize: '9px', letterSpacing: '0.1em' }}
                />
              </div>

              {/* Refresh */}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => refresh()}
                style={{ height: '32px', padding: '0 0.65rem' }}
                title="Refresh state"
              >
                <RefreshCw size={11} className={isLoading ? 'animate-spin' : ''} />
              </button>

              {/* Reset Seed */}
              <button
                type="button"
                className="btn-secondary"
                onClick={resetToDefaults}
                style={{ height: '32px', padding: '0 0.65rem' }}
                title="Reset sample data"
              >
                <RotateCcw size={11} />
              </button>

              {/* Create Escrow */}
              <Magnetic strength={0.2}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsCreateModalOpen(true)}
                  style={{ height: '32px', padding: '0 1rem', fontSize: '9px' }}
                >
                  <Plus size={12} />
                  <span>NEW ESCROW</span>
                </button>
              </Magnetic>
            </div>
          </div>

          {/* Grid of Cards */}
          {filteredEscrows.length === 0 ? (
            <div
              className="glass-card"
              style={{
                padding: '4.5rem 2rem',
                textAlign: 'center',
                margin: '2rem 0',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                }}
              >
                <Inbox size={18} color="var(--text-muted)" />
              </div>

              <h4
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.6rem',
                  fontStyle: 'italic',
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem',
                }}
              >
                No Escrows Found
              </h4>
              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'var(--text-muted)',
                  maxWidth: '380px',
                  margin: '0 auto 1.5rem auto',
                }}
              >
                {searchQuery
                  ? `No matching contracts for "${searchQuery}"`
                  : 'No escrow contracts under this filter tab.'}
              </p>

              <button
                type="button"
                className="btn-outline-gold"
                onClick={() => setIsCreateModalOpen(true)}
                style={{ fontSize: '10px', padding: '0.6rem 1.6rem' }}
              >
                <Plus size={12} />
                <span>INITIALIZE ESCROW</span>
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredEscrows.map((escrow) => (
                <EscrowCard
                  key={escrow.id}
                  escrow={escrow}
                  onSelect={selectEscrow}
                  onActionClick={handleCardAction}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Modals */}
      <CreateEscrowModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createEscrow}
      />

      <EscrowDetailModal
        escrow={selectedEscrow}
        transactions={selectedEscrow ? transactions[selectedEscrow.id] || [] : []}
        onClose={clearSelection}
        onActionClick={(actionType, targetEscrow) => {
          setActiveActionModal({ type: actionType, escrow: targetEscrow });
        }}
      />

      <ActionModal
        isOpen={Boolean(activeActionModal)}
        actionType={activeActionModal?.type || null}
        escrow={activeActionModal?.escrow || null}
        onClose={() => setActiveActionModal(null)}
        onConfirm={executeAction}
      />
    </div>
  );
};
