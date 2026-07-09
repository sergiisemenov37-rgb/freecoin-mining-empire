/**
 * useTonConnect Hook
 * Manages TON Connect wallet connection with persistence and history
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';

interface WalletState {
  address: string | null;
  connected: boolean;
  walletName: string | null;
  isLoading: boolean;
  isPrimary: boolean;
}

interface WalletHistory {
  address: string;
  walletName: string;
  connectedAt: string;
  lastUsed: string;
}

export function useTonConnect() {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    walletName: null,
    isLoading: false,
    isPrimary: false,
  });
  
  const [walletHistory, setWalletHistory] = useState<WalletHistory[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<string | null>(null);

  const wallet = useTonWallet();
  const [tonConnectUI, setTonConnectUIOptions] = useTonConnectUI();

  useEffect(() => {
    // Load wallet history from localStorage
    const savedHistory = localStorage.getItem('ton_wallet_history');
    if (savedHistory) {
      try {
        setWalletHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('[useTonConnect] Error loading wallet history:', error);
      }
    }

    // Load primary wallet from localStorage
    const savedPrimary = localStorage.getItem('ton_primary_wallet');
    if (savedPrimary) {
      setPrimaryWallet(savedPrimary);
    }
  }, []);

  useEffect(() => {
    if (wallet) {
      console.log('[useTonConnect] Wallet connected:', wallet);
      const address = wallet.account.address;
      const walletName = wallet.device.appName || 'Unknown Wallet';
      
      setState({
        address,
        connected: true,
        walletName,
        isLoading: false,
        isPrimary: primaryWallet === address,
      });
      
      // Update wallet history
      const newHistory: WalletHistory = {
        address,
        walletName,
        connectedAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };
      
      const updatedHistory = walletHistory.filter(w => w.address !== address);
      updatedHistory.unshift(newHistory);
      setWalletHistory(updatedHistory);
      localStorage.setItem('ton_wallet_history', JSON.stringify(updatedHistory));
      
      // Set as primary if no primary exists
      if (!primaryWallet) {
        setPrimaryWallet(address);
        localStorage.setItem('ton_primary_wallet', address);
        setState(prev => ({ ...prev, isPrimary: true }));
      }
      
      // Save wallet to Supabase
      saveWalletToSupabase(address, walletName);
    } else {
      console.log('[useTonConnect] Wallet disconnected');
      setState({
        address: null,
        connected: false,
        walletName: null,
        isLoading: false,
        isPrimary: false,
      });
    }
  }, [wallet, primaryWallet, walletHistory]);

  const saveWalletToSupabase = async (address: string, walletName?: string) => {
    try {
      console.log('[useTonConnect] Saving wallet to Supabase:', address);
      
      const sessionStr = localStorage.getItem('telegram_session');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (sessionStr) {
        headers['x-telegram-session'] = sessionStr;
      }
      
      const response = await fetch('/api/wallet/connect', {
        method: 'POST',
        headers,
        body: JSON.stringify({ address, walletName, isPrimary: primaryWallet === address }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[useTonConnect] Wallet saved successfully:', data);
      } else {
        console.error('[useTonConnect] Failed to save wallet:', response.statusText);
      }
    } catch (error) {
      console.error('[useTonConnect] Error saving wallet:', error);
    }
  };

  const disconnectWallet = useCallback(async () => {
    try {
      console.log('[useTonConnect] Disconnecting wallet');
      
      const sessionStr = localStorage.getItem('telegram_session');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (sessionStr) {
        headers['x-telegram-session'] = sessionStr;
      }
      
      const response = await fetch('/api/wallet/disconnect', {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        console.log('[useTonConnect] Wallet disconnected successfully');
      } else {
        console.error('[useTonConnect] Failed to disconnect wallet:', response.statusText);
      }
    } catch (error) {
      console.error('[useTonConnect] Error disconnecting wallet:', error);
    }
  }, []);

  const setAsPrimary = useCallback((address: string) => {
    setPrimaryWallet(address);
    localStorage.setItem('ton_primary_wallet', address);
    setState(prev => ({ ...prev, isPrimary: prev.address === address }));
    
    // Update Supabase
    saveWalletToSupabase(address, state.walletName || undefined);
  }, [state.walletName]);

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    ...state,
    formattedAddress: formatAddress(state.address),
    disconnectWallet,
    walletHistory,
    primaryWallet,
    setAsPrimary,
  };
}
