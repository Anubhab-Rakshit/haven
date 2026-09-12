import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export interface MidnightProvider {
  getAddress: () => Promise<string>;
  networkId: string;
}

export interface MidnightWalletState {
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;
  shortAddress: string | null;
  networkId: string;
  provider: MidnightProvider | null;
  error: string | null;
  isDemoMode: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  toggleDemoMode: () => void;
}

const MidnightWalletContext = createContext<MidnightWalletState | null>(null);

export function useMidnightWallet(): MidnightWalletState {
  const context = useContext(MidnightWalletContext);
  if (!context) {
    throw new Error('useMidnightWallet must be used within MidnightWalletProvider');
  }
  return context;
}

const DEMO_BUYER_ADDRESS = 'mn_shielded_19f8a3c82d4e7b1a9c3e5d7f2a1b4c6e8d0f2a4b';
const STORAGE_KEY = 'haven_wallet_connected';
const DEMO_KEY = 'haven_wallet_demo_mode';

export function MidnightWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true' ? DEMO_BUYER_ADDRESS : null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_KEY) !== 'false';
  });

  const shortAddress = address
    ? `${address.slice(0, 11)}...${address.slice(-6)}`
    : null;

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check for real Lace wallet in window.midnight
      if (typeof window !== 'undefined' && (window as unknown as { midnight?: { lace?: { connect: (net: string) => Promise<unknown> } } }).midnight?.lace) {
        try {
          const lace = (window as unknown as { midnight: { lace: { connect: (net: string) => Promise<{ getAddress: () => Promise<string> }> } } }).midnight.lace;
          const api = await lace.connect('testnet');
          const realAddress = await api.getAddress();
          setAddress(realAddress);
          setIsConnected(true);
          localStorage.setItem(STORAGE_KEY, 'true');
          setIsConnecting(false);
          return;
        } catch (err: unknown) {
          console.warn('Lace wallet connection prompt cancelled or failed, using simulated fallback:', err);
        }
      }

      // Simulated connection delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      setAddress(DEMO_BUYER_ADDRESS);
      setIsConnected(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem(DEMO_KEY, String(next));
      return next;
    });
  }, []);

  return (
    <MidnightWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        shortAddress,
        networkId: 'midnight-preprod',
        provider: isConnected ? { getAddress: async () => address || DEMO_BUYER_ADDRESS, networkId: 'midnight-preprod' } : null,
        error,
        isDemoMode,
        connect,
        disconnect,
        toggleDemoMode,
      }}
    >
      {children}
    </MidnightWalletContext.Provider>
  );
}
