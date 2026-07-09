/**
 * useTonConnect Hook
 * Manages TON Connect wallet connection
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { TonConnectUI, useTonWallet } from '@tonconnect/ui-react';

interface WalletState {
  address: string | null;
  connected: boolean;
  walletName: string | null;
  isLoading: boolean;
}

export function useTonConnect() {
  const [state, setState] = useState<WalletState>({
    address: null,
    connected: false,
    walletName: null,
    isLoading: false,
  });

  const wallet = useTonWallet();

  useEffect(() => {
    if (wallet) {
      console.log('[useTonConnect] Wallet connected:', wallet);
      setState({
        address: wallet.account.address,
        connected: true,
        walletName: wallet.device.appName || 'Unknown Wallet',
        isLoading: false,
      });
      
      // Save wallet to Supabase
      saveWalletToSupabase(wallet.account.address, wallet.device.appName);
    } else {
      console.log('[useTonConnect] Wallet disconnected');
      setState({
        address: null,
        connected: false,
        walletName: null,
        isLoading: false,
      });
    }
  }, [wallet]);

  const saveWalletToSupabase = async (address: string, walletName?: string) => {
    try {
      console.log('[useTonConnect] Saving wallet to Supabase:', address);
      
      // Get session from localStorage
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
        body: JSON.stringify({ address, walletName }),
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
      
      // Get session from localStorage
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

  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    ...state,
    formattedAddress: formatAddress(state.address),
    disconnectWallet,
  };
}
