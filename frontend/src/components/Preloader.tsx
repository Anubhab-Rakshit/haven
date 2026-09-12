import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=<>:;{}[]';

const STAGES = [
  { at: 0, text: 'SYNTHESIZING COMPACT CIRCUITS' },
  { at: 28, text: 'INITIALIZING PROVING KEYS & BULLETPROOFS' },
  { at: 58, text: 'VERIFYING PEDERSEN COMMITMENTS' },
  { at: 86, text: 'ENCLAVE ONLINE • ENTERING HAVEN' },
];

export const Preloader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [hash, setHash] = useState('');
  const [currentStage, setCurrentStage] = useState(STAGES[0].text);

  useEffect(() => {
    // Fast hash generator
    const hashInterval = setInterval(() => {
      let newHash = '0x';
      for (let i = 0; i < 34; i++) {
        newHash += CHARS[Math.floor(Math.random() * CHARS.length)];
      }
      setHash(newHash);
    }, 45);

    // Progress tick
    let current = 0;
    const progressInterval = setInterval(() => {
      current += Math.floor(Math.random() * 4) + 2;
      if (current >= 100) {
        current = 100;
        clearInterval(progressInterval);
        clearInterval(hashInterval);
        setTimeout(onComplete, 450);
      }
      setProgress(current);

      // Update stage text
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (current >= STAGES[i].at) {
          setCurrentStage(STAGES[i].text);
          break;
        }
      }
    }, 70);

    return () => {
      clearInterval(hashInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="preloader"
      exit={{ opacity: 0, scale: 1.03, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#020203',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        userSelect: 'none',
      }}
    >
      {/* Top Tag */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-muted)',
          letterSpacing: '0.22em',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          textTransform: 'uppercase',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-emerald)',
            boxShadow: '0 0 8px var(--accent-emerald)',
            display: 'inline-block',
          }}
        />
        <span>INITIALIZING SECURE ENCLAVE</span>
      </div>

      {/* Massive Italic Counter */}
      <div
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(5rem, 14vw, 9.5rem)',
          fontStyle: 'italic',
          fontWeight: 300,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(180deg, #ffffff 0%, rgba(255, 255, 255, 0.45) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
        }}
      >
        {progress}%
      </div>

      {/* Stage Text */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--accent-gold)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '1.75rem',
          minHeight: '16px',
          opacity: 0.9,
        }}
      >
        {currentStage}
      </div>

      {/* Sleek Line Progress Bar */}
      <div
        style={{
          width: '240px',
          height: '1px',
          background: 'rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          marginBottom: '1.75rem',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(194,168,120,0.3) 0%, var(--accent-gold) 100%)',
            boxShadow: '0 0 8px var(--accent-gold)',
            transition: 'width 0.08s ease-out',
          }}
        />
      </div>

      {/* Crypto Hash Stream */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--text-muted)',
          width: '320px',
          wordBreak: 'break-all',
          textAlign: 'center',
          opacity: 0.45,
          letterSpacing: '0.1em',
          lineHeight: 1.4,
        }}
      >
        {hash}
      </div>
    </motion.div>
  );
};
