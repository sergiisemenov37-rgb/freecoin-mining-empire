/**
 * useTelegram React Hook
 * Provides Telegram WebApp functionality using ONLY official @telegram-apps/sdk-react
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { TelegramState, TelegramActions, TelegramThemeParams, TelegramViewport, TelegramHaptic, TelegramCloudStorage } from '@/types/telegram';


// Browser fallback for development - minimal implementation
const createBrowserFallback = (): TelegramState & TelegramActions => {
  const defaultTheme: TelegramThemeParams = {
    bg_color: '#1a1a2e',
    text_color: '#ffffff',
    hint_color: '#a0a0a0',
    link_color: '#3b82f6',
    button_color: '#3b82f6',
    button_text_color: '#ffffff',
    secondary_bg_color: '#16213e',
  };

  const defaultViewport: TelegramViewport = {
    height: window.innerHeight,
    width: window.innerWidth,
    stableHeight: window.innerHeight,
    isExpanded: true,
  };

  const noopHaptic: TelegramHaptic = {
    impactOccurred: () => {},
    notificationOccurred: () => {},
    selectionChanged: () => {},
  };

  const localStorageCloudStorage: TelegramCloudStorage = {
    getKeys: (callback) => callback(Object.keys(localStorage)),
    getItems: (keys, callback) => {
      const items: Record<string, string> = {};
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) items[key] = value;
      });
      callback(items);
    },
    setItems: (items, callback) => {
      Object.entries(items).forEach(([key, value]) => localStorage.setItem(key, value));
      callback();
    },
    removeItems: (keys, callback) => {
      keys.forEach(key => localStorage.removeItem(key));
      callback();
    },
  };

  return {
    user: null,
    isTelegram: false,
    isReady: true,
    theme: defaultTheme,
    viewport: defaultViewport,
    haptic: noopHaptic,
    cloudStorage: localStorageCloudStorage,
    colorScheme: 'dark',
    version: '7.0',
    platform: 'browser',
    expand: () => {},
    close: () => {},
    ready: () => {},
    hapticImpact: () => {},
    hapticNotification: () => {},
    hapticSelection: () => {},
    enableClosingConfirmation: () => {},
    disableClosingConfirmation: () => {},
  };
};

export function useTelegram(): TelegramState & TelegramActions {
  const [state, setState] = useState<TelegramState>({
    user: null,
    isTelegram: false,
    isReady: false,
    theme: {},
    viewport: {
      height: 0,
      width: 0,
      stableHeight: 0,
      isExpanded: false,
    },
    haptic: null,
    cloudStorage: null,
    colorScheme: 'light',
    version: '',
    platform: '',
  });

  useEffect(() => {
    try {
      console.log('[useTelegram] Initializing with official SDK');
      
      // Use official SDK to retrieve launch parameters
      const launchParams = retrieveLaunchParams();
      
      console.log('[useTelegram] Official SDK launch params retrieved:', !!launchParams);
      
      // Check if running in Telegram
      const isTelegramApp = !!launchParams;
      
      if (!isTelegramApp) {
        console.log('[useTelegram] Not in Telegram, using browser fallback');
        // Browser fallback
        const fallback = createBrowserFallback();
        setState(fallback as any);
        return;
      }

      console.log('[useTelegram] Running in Telegram, setting state from SDK');
      
      // Set initial state from official SDK only
      setState({
        user: (launchParams as any).initDataUnsafe?.user || null,
        isTelegram: true,
        isReady: true,
        theme: (launchParams as any).themeParams || {},
        viewport: {
          height: (launchParams as any).viewportHeight || window.innerHeight,
          width: (launchParams as any).viewportWidth || window.innerWidth,
          stableHeight: (launchParams as any).viewportHeight || window.innerHeight,
          isExpanded: (launchParams as any).isExpanded || true,
        },
        haptic: null, // Will be accessed via SDK when needed
        cloudStorage: null, // Will be accessed via SDK when needed
        colorScheme: (launchParams as any).colorScheme || 'light',
        version: (launchParams as any).version || '',
        platform: (launchParams as any).platform || '',
      });

      console.log('[useTelegram] State set successfully');
    } catch (error) {
      console.error('[useTelegram] Error initializing Telegram SDK:', error);
      // Browser fallback on error
      const fallback = createBrowserFallback();
      setState(fallback as any);
    }
  }, []);

  const expand = useCallback(() => {
    // Access via official SDK if needed
    console.log('[useTelegram] expand called');
  }, []);

  const close = useCallback(() => {
    // Access via official SDK if needed
    console.log('[useTelegram] close called');
  }, []);

  const ready = useCallback(() => {
    // Access via official SDK if needed
    console.log('[useTelegram] ready called');
  }, []);

  const hapticImpact = useCallback((style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    console.log('[useTelegram] hapticImpact called with style:', style);
  }, []);

  const hapticNotification = useCallback((type: 'error' | 'success' | 'warning') => {
    console.log('[useTelegram] hapticNotification called with type:', type);
  }, []);

  const hapticSelection = useCallback(() => {
    console.log('[useTelegram] hapticSelection called');
  }, []);

  const enableClosingConfirmation = useCallback(() => {
    console.log('[useTelegram] enableClosingConfirmation called');
  }, []);

  const disableClosingConfirmation = useCallback(() => {
    console.log('[useTelegram] disableClosingConfirmation called');
  }, []);

  return {
    ...state,
    expand,
    close,
    ready,
    hapticImpact,
    hapticNotification,
    hapticSelection,
    enableClosingConfirmation,
    disableClosingConfirmation,
  };
}
