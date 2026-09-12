import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Globe, Terminal, Disc, ShieldCheck, Code2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Magnetic } from './Magnetic';

gsap.registerPlugin(ScrollTrigger);

export const Footer: React.FC = () => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let proxy = { skew: 0 };
    let skewSetter = gsap.quickSetter(textRef.current, 'skewY', 'deg');
    let clamp = gsap.utils.clamp(-20, 20);

    const trigger = ScrollTrigger.create({
      onUpdate: (self) => {
        let skew = clamp(self.getVelocity() / -300);
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0,
            duration: 0.8,
            ease: 'power3',
            overwrite: true,
            onUpdate: () => skewSetter(proxy.skew),
          });
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <footer className="cinematic-footer">
      <div className="footer-content">
        {/* Massive Skewed Animated Headline */}
        <motion.div
          ref={textRef}
          className="footer-massive-text"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          Settle the Unseen.
        </motion.div>

        {/* 2-Column Grid */}
        <div className="footer-grid">
          <div className="footer-col">
            <h4 className="footer-heading">MIDNIGHT NETWORK</h4>
            <p className="footer-desc">
              Haven utilizes Zero-Knowledge proofs and Compact zkSNARK circuits on the Midnight Preprod testnet to guarantee observable privacy and shielded escrow settlement.
            </p>
          </div>

          <div className="footer-col align-right">
            <h4 className="footer-heading">CONNECT</h4>
            <div className="social-links">
              <Magnetic pull={0.4}>
                <a
                  href="https://github.com/Anubhab-Rakshit/midnight-lock"
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  title="GitHub Repository"
                >
                  <Code2 size={18} />
                </a>
              </Magnetic>
              <Magnetic pull={0.4}>
                <a
                  href="https://docs.midnight.network"
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  title="Midnight Docs"
                >
                  <Globe size={18} />
                </a>
              </Magnetic>
              <Magnetic pull={0.4}>
                <a
                  href="https://explorer.preprod.midnight.network"
                  target="_blank"
                  rel="noreferrer"
                  className="social-link"
                  title="Explorer & Circuits"
                >
                  <Terminal size={18} />
                </a>
              </Magnetic>
              <Magnetic pull={0.4}>
                <a
                  href="#privacy-spec"
                  className="social-link"
                  title="ZK Verification"
                >
                  <Disc size={18} />
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <span className="text-mono text-muted">&copy; 2026 Haven Protocol</span>
          <span className="text-mono text-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={12} color="var(--accent-emerald)" />
            A Cryptographic Registry • 90 ZK Tests Verified
          </span>
        </div>
      </div>
    </footer>
  );
};
