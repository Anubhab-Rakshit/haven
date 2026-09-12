import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Cpu,
  Layers,
  FileCode2,
  Wallet,
  Database,
  KeyRound,
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { Magnetic } from './Magnetic';
import { useMidnightWallet } from '../context/MidnightWalletContext';

interface AboutHavenViewProps {
  onEnterHaven: () => void;
  onCreateClick: () => void;
}

export const AboutHavenView: React.FC<AboutHavenViewProps> = ({
  onEnterHaven,
  onCreateClick,
}) => {
  const { isConnected, connect } = useMidnightWallet();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  const faqs = [
    {
      q: 'Do I need to install anything besides Lace?',
      a: "Yes — just the Lace browser extension configured on the Midnight Preprod network. Everything else runs directly in your browser and through Haven's high-performance API server.",
    },
    {
      q: 'What happens to my private data?',
      a: 'It never leaves your side as plaintext. Amount and condition are cryptographically committed as Pedersen hashes. Your identity is a private witness. Even the transaction history on-chain only exposes state transitions.',
    },
    {
      q: "Can anyone see my escrow's amount?",
      a: 'No. The ledger stores only an uninvertible hash commitment. You and your counterparty prove your witnesses in zero knowledge when transacting — nobody else learns anything.',
    },
    {
      q: 'What is DUST / tDUST?',
      a: "tDUST is testnet DUST — Midnight's native transaction token on the Preprod testnet. You deploy contracts and submit proofs with it. It carries no real monetary value.",
    },
    {
      q: 'How long do deploys and actions take?',
      a: 'Deploying a fresh escrow takes 1–3 minutes (DUST generation + ZK witness compilation). State transitions (deposit, confirm delivery, release) execute in 10–30 seconds each.',
    },
    {
      q: 'Can I cancel my escrow?',
      a: 'If the escrow is still in Created state (before the buyer deposits), the buyer can safely cancel it. Once funded, funds are locked on-chain and the lifecycle continues through delivery or the dispute pathway.',
    },
    {
      q: 'What happens if I close the tab mid-deploy?',
      a: 'Your escrow transaction is submitted directly to the Midnight network. Reconnect your wallet and refresh; the contract will show in your active escrow list once confirmed on-chain.',
    },
    {
      q: 'Who resolves a dispute?',
      a: 'The seller can call resolve to advance a disputed escrow to Resolved (per the current contract circuit logic). A future upgrade supports agreed third-party arbitration with selective zero-knowledge disclosure.',
    },
    {
      q: 'Is this mainnet-ready?',
      a: 'Haven currently operates on Midnight Preprod. All smart contracts and Compact circuits are mainnet-compatible; a production mainnet deployment will follow Midnight mainnet rollout.',
    },
    {
      q: 'Are there fees?',
      a: 'Haven charges zero platform fees. You only pay standard DUST transaction fees required by the Midnight validator network.',
    },
    {
      q: 'What if I need proof the escrow exists?',
      a: 'Every contract has a public contract address and transaction hash verifiable on the Midnight block explorer — provable by anyone without revealing underlying terms or balances.',
    },
    {
      q: "How do I see other people's escrows?",
      a: "You don't — strictly by design. Each user sees only escrows cryptographically tied to their own shielded address.",
    },
  ];

  return (
    <div className="haven-container about-haven-container" style={{ paddingBottom: '7rem', paddingTop: '1rem' }}>
      {/* ========================================================
          SECTION 1 — Hero
      ======================================================== */}
      <section className="about-hero-section" style={{ textAlign: 'center', padding: '3.5rem 0 5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--accent-gold)',
                boxShadow: '0 0 10px var(--accent-gold)',
              }}
            />
            <span className="section-label" style={{ marginBottom: 0 }}>
              MIDNIGHT NETWORK • ZERO-KNOWLEDGE ESCROW
            </span>
          </div>

          <h1
            className="hero-title"
            style={{
              fontSize: 'clamp(3rem, 7.5vw, 6.2rem)',
              lineHeight: 1.02,
              marginBottom: '1.5rem',
              maxWidth: '960px',
              margin: '0 auto 1.5rem auto',
            }}
          >
            Private Escrow, Shielded<span style={{ color: 'var(--accent-gold)' }}>.</span>
          </h1>

          <p
            className="hero-subtitle"
            style={{
              fontSize: 'clamp(10px, 2.5vw, 12px)',
              maxWidth: '680px',
              margin: '0 auto 2.75rem auto',
              lineHeight: 1.8,
            }}
          >
            SETTLE TRANSACTIONS WITHOUT REVEALING AMOUNTS, IDENTITIES, OR TERMS. HAVEN IS A ZERO-KNOWLEDGE ESCROW PROTOCOL BUILT ON THE MIDNIGHT NETWORK.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Magnetic strength={0.3}>
              <button
                type="button"
                className="btn-primary"
                onClick={onEnterHaven}
                style={{ padding: '0.85rem 2.5rem', fontSize: '11px', letterSpacing: '0.18em' }}
              >
                <span>ENTER HAVEN</span>
                <ArrowRight size={14} />
              </button>
            </Magnetic>

            <Magnetic strength={0.3}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  const elem = document.getElementById('how-it-works');
                  elem?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ padding: '0.85rem 1.8rem', fontSize: '11px', letterSpacing: '0.15em' }}
              >
                <span>EXPLORE ARCHITECTURE</span>
              </button>
            </Magnetic>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 2 — What Is Haven
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{ padding: 'clamp(1.5rem, 5vw, 3.5rem)', position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              right: '-10%',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent-gold-glow) 0%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />

          <span className="section-label">WHAT IS HAVEN</span>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontStyle: 'italic',
              fontWeight: 400,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              lineHeight: 1.15,
              marginTop: '0.4rem',
              marginBottom: '1.5rem',
            }}
          >
            A cryptographic registry for conditional settlement<span style={{ color: 'var(--accent-gold)' }}>.</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.8,
                  color: 'rgba(240, 240, 240, 0.85)',
                  marginBottom: '1.25rem',
                }}
              >
                Traditional escrow depends on a trusted third party — a bank, a lawyer, or a centralized platform — who sees everything: who you are, how much you're transacting, and the terms of the deal. That middleman becomes a single point of failure, a point of surveillance, and a point of censorship.
              </p>
              <p
                style={{
                  fontSize: '14px',
                  lineHeight: 1.8,
                  color: 'rgba(240, 240, 240, 0.85)',
                }}
              >
                Haven replaces that middleman with zero-knowledge proofs. The escrow contract — the rules that hold and release funds — runs on the Midnight blockchain, but every sensitive detail remains shielded.
              </p>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ marginTop: '3px', color: 'var(--accent-gold)' }}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-gold)', marginBottom: '2px' }}>
                    PEDERSEN COMMITMENTS
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    The amount is committed on-chain as a Pedersen hash, never an exposed integer.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ marginTop: '3px', color: 'var(--accent-emerald)' }}>
                  <Lock size={16} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-emerald)', marginBottom: '2px' }}>
                    UNREVEALED CONDITIONS
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    The delivery condition is hashed and never revealed publicly on ledger.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ marginTop: '3px', color: '#a78bfa' }}>
                  <EyeOff size={16} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#a78bfa', marginBottom: '2px' }}>
                    SHIELDED COUNTERPARTIES
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    Buyer and seller shielded public keys are hidden behind private witness commitments.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{ marginTop: '3px', color: 'var(--text-primary)' }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-primary)', marginBottom: '2px' }}>
                    VERIFIABLE STATE MACHINE
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    State progression (created → funded → delivered → released) is fully transparent and auditable by anyone.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '2rem',
              padding: '1.25rem 1.5rem',
              background: 'rgba(194, 168, 120, 0.05)',
              borderLeft: '3px solid var(--accent-gold)',
              borderRadius: '0 6px 6px 0',
            }}
          >
            <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.15rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              "A person who reads Haven's public ledger can see that an escrow exists and what state it's in. They cannot see what it's for, how much it holds, or who is involved. That's the difference between privacy-by-promise and privacy-by-proof."
            </p>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 3 — The Problem
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label" style={{ color: 'var(--accent-crimson)' }}>THE PROBLEM</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
              }}
            >
              Everyone sees too much<span style={{ color: 'var(--accent-crimson)' }}>.</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {[
              {
                icon: AlertTriangle,
                title: 'Third-Party Custody Risk',
                desc: 'A trusted middleman holds your funds, custody keys, and sensitive business transaction details.',
                border: 'rgba(255, 80, 80, 0.3)',
              },
              {
                icon: Eye,
                title: 'Complete Surveillance',
                desc: 'Your identity, transaction amount, and underlying milestone terms are fully exposed to intermediaries.',
                border: 'rgba(255, 80, 80, 0.3)',
              },
              {
                icon: Shield,
                title: 'Censorship & Hack Vulnerability',
                desc: 'The middleman can be hacked, coerced, shut down, or pressured by jurisdictions to seize assets.',
                border: 'rgba(255, 80, 80, 0.3)',
              },
              {
                icon: KeyRound,
                title: 'Information Leakage',
                desc: "Counterparties cannot verify each other's commitments or solvency without leaking private financials.",
                border: 'rgba(255, 80, 80, 0.3)',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.75rem',
                  borderTop: `2px solid ${card.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ color: 'var(--accent-crimson)' }}>
                  <card.icon size={22} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="glass-card"
            style={{
              padding: '1.5rem 2rem',
              textAlign: 'center',
              border: '1px dashed rgba(255, 80, 80, 0.3)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255, 255, 255, 0.85)' }}>
              For a Swiss vault, a private asset sale, a confidential milestone payment, or any high-value conditional transaction — these are unacceptable risks.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 4 — How Haven Fixes It (The Solution)
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label" style={{ color: 'var(--accent-emerald)' }}>THE SOLUTION</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
                marginBottom: '0.75rem',
              }}
            >
              Trust, verified — not assumed<span style={{ color: 'var(--accent-emerald)' }}>.</span>
            </h2>
            <p
              style={{
                fontSize: '14px',
                color: 'var(--text-muted)',
                maxWidth: '720px',
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Haven encodes the escrow agreement as a Compact zkSNARK circuit and deploys it to the Midnight Network. The contract enforces the rules; zero-knowledge proofs enforce the privacy.
            </p>
          </div>

          {/* Key Guarantees Comparison Grid */}
          <div className="glass-card" style={{ padding: 'clamp(1rem, 3vw, 2rem)', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <Scale size={16} color="var(--accent-emerald)" />
              <span className="section-label" style={{ marginBottom: 0, color: 'var(--accent-emerald)' }}>
                KEY GUARANTEES &amp; OBSERVABILITY COMPARISON
              </span>
            </div>

            {/* Custom Responsive Styled Grid */}
            <div className="comparison-table-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Header */}
              <div
                className="comparison-grid-header"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                }}
              >
                <div style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Eye size={12} />
                  <span>What the network sees</span>
                </div>
                <div style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <EyeOff size={12} />
                  <span>What the network never sees</span>
                </div>
              </div>

              {/* Rows */}
              {[
                {
                  seen: 'That an escrow exists (on-chain commitments)',
                  unseen: 'The escrow amount (shielded Pedersen commitment)',
                },
                {
                  seen: 'The current state (created → funded → delivered…)',
                  unseen: 'The delivery condition (hashed witness)',
                },
                {
                  seen: 'Transaction hashes and timestamps',
                  unseen: "The buyer's shielded identity",
                },
                {
                  seen: 'Deposit & dispute counters',
                  unseen: "The seller's shielded identity",
                },
                {
                  seen: 'Public zkSNARK proof validity',
                  unseen: 'The actual underlying contract terms',
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="comparison-grid-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '0.9rem 1.25rem',
                    background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                    <span>{row.seen}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-emerald)' }}>
                    <ShieldCheck size={14} style={{ flexShrink: 0 }} />
                    <span>{row.unseen}</span>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                fontSize: '12px',
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                padding: '0.75rem 1rem',
                background: 'rgba(52, 211, 153, 0.05)',
                border: '1px solid rgba(52, 211, 153, 0.15)',
                borderRadius: '6px',
              }}
            >
              Every state transition (deposit, delivery, release, dispute) is a publicly verifiable proof that the rules were followed, without exposing any private witness.
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 5 — How It Works (6 Steps)
      ======================================================== */}
      <section id="how-it-works" style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-label">HOW IT WORKS</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
              }}
            >
              Six steps to a shielded settlement<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {[
              {
                step: '01',
                title: 'Connect your wallet',
                desc: 'Install the Lace browser extension, switch it to the Midnight Preprod network, and connect. Your shielded key is your digital identity in Haven.',
                tag: 'LACE WALLET',
                color: 'var(--accent-gold)',
              },
              {
                step: '02',
                title: 'Create an escrow',
                desc: 'Set the seller\'s shielded address, the locked amount (tDUST), and the delivery condition — e.g. "Deliver Phase 2 verification proof by Sept 30." The amount and condition are cryptographically hashed into Pedersen commitments.',
                tag: 'HASH COMMITMENTS',
                color: 'var(--accent-gold)',
              },
              {
                step: '03',
                title: 'Deploy contract instance',
                desc: 'Haven compiles the ZK witness and deploys a fresh contract instance to Midnight. Proof generation takes 1–3 minutes. You receive a unique contract address and on-chain transaction hash.',
                tag: 'ZK PROOF COMPILATION',
                color: 'var(--accent-violet)',
              },
              {
                step: '04',
                title: 'Deposit locked funds',
                desc: 'The buyer calls deposit, proving in zero knowledge that they are the authorized buyer and the escrow is in Created state. The ledger only records a counter increment and a state change to Funded.',
                tag: 'BUYER PROOF',
                color: 'var(--accent-emerald)',
              },
              {
                step: '05',
                title: 'Confirm condition fulfillment',
                desc: 'The seller fulfills the agreed off-chain condition and calls confirmDelivery, proving their witness. The on-chain state moves directly to Delivered.',
                tag: 'SELLER PROOF',
                color: '#a78bfa',
              },
              {
                step: '06',
                title: 'Release & Final Settlement',
                desc: 'The buyer calls release. Funds move to the seller; state moves to Released. The escrow settles with zero middleman and zero disclosure.',
                tag: 'FINAL SETTLEMENT',
                color: 'var(--accent-emerald)',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  position: 'relative',
                  borderTop: `2px solid ${step.color}`,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', fontWeight: 600, color: step.color }}>
                      {step.step}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '9px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.12em',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {step.tag}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem 1.5rem',
              background: 'rgba(18, 16, 22, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            <span style={{ color: 'var(--accent-gold)' }}>Note:</span> If anything goes wrong at any point, the buyer can call dispute → resolve, taking the contract into a resolvable Disputed/Resolved state. If a deal is called off before funding, the buyer can cancel.
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 6 — Escrow Lifecycle State Machine
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label">LIFECYCLE</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
              }}
            >
              A verifiable state machine<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </h2>
          </div>

          {/* State Machine Diagram Visualizer */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}>
              STATE FLOW GRAPH
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.55)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px',
                lineHeight: 1.7,
                color: 'var(--text-primary)',
                overflowX: 'auto',
              }}
            >
              <pre style={{ margin: 0 }}>
{`Created
  ├── deposit ─────────→ Funded
  │                        ├── confirmDelivery ──→ Delivered ──→ release ──→ Released
  │                        └── dispute ──────────→ Disputed  ──→ resolve ──→ Resolved
  └── cancel ──────────→ Cancelled`}
              </pre>
            </div>
          </div>

          {/* State Table Rendered as Styled Responsive Grid */}
          <div className="glass-card" style={{ padding: 'clamp(1rem, 3vw, 2rem)', overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--accent-gold)', marginBottom: '1.25rem' }}>
              STATE DEFINITIONS &amp; CALL TRIGGER PERMISSIONS
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {/* Header */}
              <div
                className="state-table-header"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '140px 1fr 120px',
                  padding: '0.75rem 1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'var(--text-muted)',
                }}
              >
                <div>State</div>
                <div>Meaning</div>
                <div style={{ textAlign: 'right' }}>Triggered By</div>
              </div>

              {/* Rows */}
              {[
                {
                  state: 'Created',
                  badge: 'created',
                  meaning: 'Escrow deployed on Midnight, funds not yet locked on-chain.',
                  trigger: '—',
                },
                {
                  state: 'Funded',
                  badge: 'funded',
                  meaning: 'Buyer deposited tokens, locked by smart contract circuit.',
                  trigger: 'Buyer',
                },
                {
                  state: 'Delivered',
                  badge: 'delivered',
                  meaning: 'Seller fulfilled the off-chain condition and posted witness proof.',
                  trigger: 'Seller',
                },
                {
                  state: 'Released',
                  badge: 'released',
                  meaning: 'Funds unlocked and released to seller — settlement complete.',
                  trigger: 'Buyer',
                },
                {
                  state: 'Disputed',
                  badge: 'disputed',
                  meaning: 'Buyer raised a challenge requiring resolution before release.',
                  trigger: 'Buyer',
                },
                {
                  state: 'Resolved',
                  badge: 'resolved',
                  meaning: 'Dispute resolved per smart contract logic — settlement complete.',
                  trigger: 'Seller',
                },
                {
                  state: 'Cancelled',
                  badge: 'cancelled',
                  meaning: 'Escrow voided and terminated before funding.',
                  trigger: 'Buyer',
                },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className="state-table-row"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '140px 1fr 120px',
                    padding: '0.85rem 1.25rem',
                    background: idx % 2 === 0 ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.015)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '6px',
                    alignItems: 'center',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <span className={`badge-state ${row.badge}`}>{row.state}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {row.meaning}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-gold)', textAlign: 'right' }}>
                    {row.trigger}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Every transition is a zero-knowledge circuit call — the network verifies the proof, not the data.
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 7 — Features & Capabilities
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label">CAPABILITIES</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
              }}
            >
              What Haven provides<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              {
                title: 'Private Amounts',
                desc: 'Escrow amounts are committed on-chain as Pedersen hashes. Wallet balances and escrow amounts are never public.',
                icon: Shield,
                accent: 'var(--accent-gold)',
              },
              {
                title: 'Private Conditions',
                desc: 'Delivery terms and commercial milestone descriptions are hashed into commitments and revealed to no one.',
                icon: Lock,
                accent: 'var(--accent-gold)',
              },
              {
                title: 'Anonymous Parties',
                desc: 'Buyer and seller identities are hidden behind ZK commitments, protecting counterparties from surveillance.',
                icon: EyeOff,
                accent: 'var(--accent-violet)',
              },
              {
                title: 'Verifiable State',
                desc: 'Transparent, tamper-proof state transitions that anyone can audit without compromising data confidentiality.',
                icon: FileCheck,
                accent: 'var(--accent-emerald)',
              },
              {
                title: 'Dispute Resolution',
                desc: 'Built-in disputed → resolved execution pathway with selective disclosure guarantees for high-stakes agreements.',
                icon: Scale,
                accent: 'var(--accent-crimson)',
              },
              {
                title: 'On-chain Accountability',
                desc: 'Every single action is a real, verifiable transaction with an immutable tx hash, timestamp, and block receipt.',
                icon: Zap,
                accent: 'var(--accent-gold)',
              },
              {
                title: 'Per-User Privacy',
                desc: "You only ever see the escrows you created. Other parties' deals remain completely invisible to you.",
                icon: KeyRound,
                accent: 'var(--accent-emerald)',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  borderTop: `2px solid ${feat.accent}`,
                }}
              >
                <div style={{ color: feat.accent }}>
                  <feat.icon size={20} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-primary)' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 8 — The Tech Stack
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label">TECHNOLOGY</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
              }}
            >
              Built on Midnight's cryptography<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem',
            }}
          >
            {[
              {
                title: 'Midnight Network (Preprod)',
                desc: 'A purpose-built, data-safe blockchain designed specifically for zero-knowledge and shielded decentralized applications.',
                icon: Layers,
              },
              {
                title: 'Compact (v0.23)',
                desc: 'A high-level domain-specific smart contract language where escrow business logic compiles into succinct zkSNARK circuits.',
                icon: FileCode2,
              },
              {
                title: 'Zero-Knowledge Proofs',
                desc: 'Pedersen commitments + persistent hashes prove computational statements without revealing any private witnesses.',
                icon: Cpu,
              },
              {
                title: 'Midnight.js SDK',
                desc: 'Official Midnight client library that handles Lace wallet connection, proof generation, and contract deployment.',
                icon: Zap,
              },
              {
                title: 'Lace Wallet',
                desc: 'Your shielded identity and key management suite. Generates mn_shielded_... addresses for cryptographic auth.',
                icon: Wallet,
              },
              {
                title: 'Supabase Data Layer',
                desc: 'High-speed encrypted persistence layer for local escrow metadata and quick index caching (never private witnesses).',
                icon: Database,
              },
            ].map((tech, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ color: 'var(--accent-gold)' }}>
                  <tech.icon size={20} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-primary)' }}>
                  {tech.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {tech.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            className="glass-card"
            style={{
              padding: '1.25rem 1.75rem',
              textAlign: 'center',
              background: 'rgba(18, 16, 22, 0.4)',
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
              Haven currently runs on Midnight Preprod (testnet) — a fully public production deployment follows.
            </span>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 9 — How to Use (For Users)
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label">GETTING STARTED</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
              }}
            >
              Using Haven in ninety seconds<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {[
              {
                num: '1',
                title: 'Get Lace',
                text: 'Install the Lace browser extension and configure it to Midnight Preprod.',
              },
              {
                num: '2',
                title: 'Connect',
                text: 'Click CONNECT LACE in the navbar and approve in your wallet. Your shielded address appears in the top-right.',
              },
              {
                num: '3',
                title: 'Create',
                text: 'Hit NEW ESCROW. Enter the seller\'s shielded address, amount (tDUST), and delivery condition.',
              },
              {
                num: '4',
                title: 'Deploy',
                text: 'Confirm and deploy. Proof generation takes 1–3 minutes; progress streams in the transaction log.',
              },
              {
                num: '5',
                title: 'Manage',
                text: 'Open any escrow card to deposit, confirm delivery, release, dispute, resolve, or cancel.',
              },
              {
                num: '6',
                title: 'Track',
                text: 'Watch the real on-chain state, explorer tx hashes, and transaction history in the escrow detail view.',
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(194, 168, 120, 0.1)',
                    border: '1px solid rgba(194, 168, 120, 0.3)',
                    color: 'var(--accent-gold)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                    {step.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 10 — FAQ Accordion
      ======================================================== */}
      <section style={{ marginBottom: '5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-label">FAQ</span>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                fontStyle: 'italic',
                color: 'var(--text-primary)',
                marginTop: '0.3rem',
              }}
            >
              Questions, answered<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </h2>
          </div>

          <div style={{ maxWidth: '840px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="glass-card"
                  style={{
                    borderRadius: '8px',
                    overflow: 'hidden',
                    borderColor: isOpen ? 'rgba(194, 168, 120, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                    transition: 'border-color 0.3s ease',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      gap: '1rem',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.2rem', lineHeight: 1.3 }}>
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ color: isOpen ? 'var(--accent-gold)' : 'var(--text-muted)', flexShrink: 0 }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div
                          style={{
                            padding: '0 1.5rem 1.25rem 1.5rem',
                            fontSize: '13px',
                            lineHeight: 1.7,
                            color: 'rgba(240, 240, 240, 0.8)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
                            paddingTop: '0.85rem',
                          }}
                        >
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          SECTION 11 — CTA Banner
      ======================================================== */}
      <section>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{
            padding: 'clamp(2.5rem, 6vw, 4.5rem) 1.5rem',
            textAlign: 'center',
            background: 'radial-gradient(ellipse at center, rgba(194, 168, 120, 0.12) 0%, rgba(18, 16, 22, 0.8) 100%)',
            border: '1px solid rgba(194, 168, 120, 0.3)',
            borderRadius: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <span className="section-label">START PROTECTING</span>

          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2.6rem, 6vw, 4.8rem)',
              fontStyle: 'italic',
              fontWeight: 300,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              marginTop: '0.5rem',
              marginBottom: '1.25rem',
            }}
          >
            Settle the Unseen<span style={{ color: 'var(--accent-gold)' }}>.</span>
          </h2>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--text-muted)',
              maxWidth: '540px',
              margin: '0 auto 2.25rem auto',
              lineHeight: 1.7,
            }}
          >
            Deploy verifiable zero-knowledge escrows on the Midnight Network with complete data confidentiality.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {!isConnected ? (
              <Magnetic strength={0.3}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => connect()}
                  style={{ padding: '0.85rem 2.25rem', fontSize: '11px', letterSpacing: '0.15em' }}
                >
                  <Wallet size={14} />
                  <span>CONNECT LACE &amp; CREATE ESCROW</span>
                </button>
              </Magnetic>
            ) : (
              <Magnetic strength={0.3}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={onCreateClick}
                  style={{ padding: '0.85rem 2.25rem', fontSize: '11px', letterSpacing: '0.15em' }}
                >
                  <Sparkles size={14} />
                  <span>CREATE NEW ESCROW</span>
                </button>
              </Magnetic>
            )}

            <Magnetic strength={0.3}>
              <button
                type="button"
                className="btn-secondary"
                onClick={onEnterHaven}
                style={{ padding: '0.85rem 2rem', fontSize: '11px', letterSpacing: '0.15em' }}
              >
                <span>VIEW ACTIVE DASHBOARD</span>
              </button>
            </Magnetic>
          </div>

          <div
            style={{
              marginTop: '3rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255, 255, 255, 0.35)',
            }}
          >
            HAVEN PROTOCOL • 2026 • A CRYPTOGRAPHIC REGISTRY • 90 ZK TESTS VERIFIED
          </div>
        </motion.div>
      </section>
    </div>
  );
};
