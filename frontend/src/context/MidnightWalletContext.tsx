import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { InitialAPI, ConnectedAPI, Configuration } from '@midnight-ntwrk/dapp-connector-api';

export interface MidnightProvider {
  getAddress: () => Promise<string>;
  getConfiguration: () => Promise<Configuration>;
  getShieldedAddresses: () => Promise<{ shieldedAddress: string; shieldedCoinPublicKey: string; shieldedEncryptionPublicKey: string }>;
  getUnshieldedAddress: () => Promise<{ unshieldedAddress: string }>;
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
  availableWallets: Array<{ id: string; name: string; icon: string; apiVersion: string }>;
  connect: (walletId?: string) => Promise<void>;
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
const STORAGE_ADDRESS_KEY = 'haven_wallet_address';
const STORAGE_WALLET_ID_KEY = 'haven_wallet_id';
const DEMO_KEY = 'haven_wallet_demo_mode';
const NETWORK_ID = 'midnight-preprod';

function getAvailableWallets(): Array<{ id: string; api: InitialAPI }> {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.entries(window.midnight)
    .filter(([, api]) => api && typeof api.connect === 'function')
    .map(([id, api]) => ({ id, api }));
}

function getMidnightWallets(): Array<{ id: string; name: string; icon: string; apiVersion: string }> {
  if (typeof window === 'undefined' || !window.midnight) return [];
  return Object.entries(window.midnight)
    .filter(([, api]) => api && typeof api.connect === 'function')
    .map(([id, api]) => ({
      id,
      name: api.name || id,
      icon: api.icon || '',
      apiVersion: api.apiVersion || '',
    }));
}

export function MidnightWalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(() => {
    if (localStorage.getItem(STORAGE_KEY) === 'true') {
      return localStorage.getItem(STORAGE_ADDRESS_KEY) || DEMO_BUYER_ADDRESS;
    }
    return null;
  });
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_KEY) !== 'false';
  });
  const [availableWallets, setAvailableWallets] = useState<Array<{ id: string; name: string; icon: string; apiVersion: string }>>([]);
  const [connectedApi, setConnectedApi] = useState<ConnectedAPI | null>(null);

  // Scan for available wallets on mount and periodically
  useEffect(() => {
    const scan = () => {
      setAvailableWallets(getMidnightWallets());
    };
    scan();
    const interval = setInterval(scan, 3000);
    return () => clearInterval(interval);
  }, []);

  const shortAddress = address
    ? `${address.slice(0, 11)}...${address.slice(-6)}`
    : null;

  const connect = useCallback(async (walletId?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const wallets = getAvailableWallets();

      if (wallets.length === 0) {
        throw new Error(
          'No Midnight wallet detected. Install the Lace browser extension and reload.'
        );
      }

      // Select wallet: use specified id, or if only one wallet, auto-select
      let selected = wallets[0];
      if (walletId) {
        const found = wallets.find((w) => w.id === walletId);
        if (found) selected = found;
      }

      const api = await selected.api.connect(NETWORK_ID);

      // Get the shielded address (the private address used for ZK escrows)
      const shielded = await api.getShieldedAddresses();
      const walletAddress = shielded.shieldedAddress;

      setConnectedApi(api);
      setAddress(walletAddress);
      setIsConnected(true);
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem(STORAGE_ADDRESS_KEY, walletAddress);
      localStorage.setItem(STORAGE_WALLET_ID_KEY, selected.id);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(message);
      setIsConnected(false);
      setAddress(null);
      setConnectedApi(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_ADDRESS_KEY);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setAddress(null);
    setConnectedApi(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_ADDRESS_KEY);
    localStorage.removeItem(STORAGE_WALLET_ID_KEY);
  }, []);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode((prev) => {
      const next = !prev;
      localStorage.setItem(DEMO_KEY, String(next));
      return next;
    });
  }, []);

  const provider: MidnightProvider | null = isConnected && connectedApi
    ? {
        getAddress: async () => {
          const shielded = await connectedApi.getShieldedAddresses();
          return shielded.shieldedAddress;
        },
        getConfiguration: () => connectedApi.getConfiguration(),
        getShieldedAddresses: () => connectedApi.getShieldedAddresses(),
        getUnshieldedAddress: () => connectedApi.getUnshieldedAddress(),
        networkId: NETWORK_ID,
      }
    : null;

  return (
    <MidnightWalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        shortAddress,
        networkId: NETWORK_ID,
        provider,
        error,
        isDemoMode,
        availableWallets,
        connect,
        disconnect,
        toggleDemoMode,
      }}
    >
      {children}
    </MidnightWalletContext.Provider>
  );
}
