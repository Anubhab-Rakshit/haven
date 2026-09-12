import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';

import { MidnightWalletProvider } from './context/MidnightWalletContext';
import { Preloader } from './components/Preloader';
import { CustomCursor } from './components/CustomCursor';
import { LiquidAura } from './components/LiquidAura';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EscrowBoard } from './components/EscrowBoard';
import { ProtocolStatsView } from './components/ProtocolStatsView';
import { ZKExplorerView } from './components/ZKExplorerView';
import { CreateEscrowModal } from './components/CreateEscrowModal';
import { useEscrowService } from './hooks/useEscrowService';

function AppContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeView, setActiveView] = useState<'escrows' | 'stats' | 'explorer'>('escrows');
  const [isGlobalCreateOpen, setIsGlobalCreateOpen] = useState(false);

  const { escrows, createEscrow } = useEscrowService();

  // Lenis Smooth Momentum Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      {/* Preloader with AnimatePresence */}
      <AnimatePresence mode="wait">
        {!isLoaded && <Preloader key="preloader" onComplete={() => setIsLoaded(true)} />}
      </AnimatePresence>

      {/* Visual Canvas Effects */}
      <CustomCursor />
      <LiquidAura />

      {/* Main Content Area Fade-in after preloader finishes */}
      {isLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <Navbar
            activeView={activeView}
            setActiveView={setActiveView}
            onCreateClick={() => setIsGlobalCreateOpen(true)}
          />

          <div className="haven-layout">
            <main style={{ marginTop: '120px', minHeight: 'calc(100vh - 400px)', display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">
                {activeView === 'escrows' && (
                  <motion.div
                    key="escrows"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: '100%' }}
                  >
                    <EscrowBoard />
                  </motion.div>
                )}

                {activeView === 'stats' && (
                  <motion.div
                    key="stats"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: '100%' }}
                  >
                    <ProtocolStatsView escrows={escrows} />
                  </motion.div>
                )}

                {activeView === 'explorer' && (
                  <motion.div
                    key="explorer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: '100%' }}
                  >
                    <ZKExplorerView />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            <Footer />
          </div>

          {/* Global Quick Create Modal */}
          <CreateEscrowModal
            isOpen={isGlobalCreateOpen}
            onClose={() => setIsGlobalCreateOpen(false)}
            onSubmit={createEscrow}
          />
        </motion.div>
      )}
    </>
  );
}

export function App() {
  return (
    <MidnightWalletProvider>
      <AppContent />
    </MidnightWalletProvider>
  );
}

export default App;
