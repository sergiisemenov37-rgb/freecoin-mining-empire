/**
 * useTelegram React Hook
 * Provides Telegram WebApp functionality using official window.Telegram.WebApp API
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
      console.log('[useTelegram] =========================================');
      console.log('[useTelegram] Initializing with window.Telegram.WebApp');
      
      // Log window.Telegram availability
      console.log('[useTelegram] window.Telegram exists:', !!(window as any).Telegram);
      console.log('[useTelegram] window.Telegram.WebApp exists:', !!(window as any).Telegram?.WebApp);
      
      const webApp = (window as any).Telegram?.WebApp;
      
      if (!webApp) {
        console.log('[useTelegram] Telegram WebApp not available, using browser fallback');
        const fallback = createBrowserFallback();
        setState(fallback as any);
        return;
      }

      // Log all Telegram WebApp properties
      console.log('[useTelegram] Telegram WebApp properties:');
      console.log('[useTelegram] - initData exists:', !!webApp.initData);
      console.log('[useTelegram] - initData length:', webApp.initData?.length);
      console.log('[useTelegram] - initDataUnsafe:', webApp.initDataUnsafe);
      console.log('[useTelegram] - version:', webApp.version);
      console.log('[useTelegram] - platform:', webApp.platform);
      console.log('[useTelegram] - colorScheme:', webApp.colorScheme);
      console.log('[useTelegram] - themeParams:', webApp.themeParams);
      console.log('[useTelegram] - isExpanded:', webApp.isExpanded);
      console.log('[useTelegram] - viewportHeight:', webApp.viewportHeight);
      console.log('[useTelegram] - viewportWidth:', webApp.viewportWidth);
      
      // Initialize Telegram WebApp
      console.log('[useTelegram] Calling Telegram.WebApp.ready()');
      webApp.ready();
      
      console.log('[useTelegram] Calling Telegram.WebApp.expand()');
      webApp.expand();
      
      console.log('[useTelegram] Calling Telegram.WebApp.enableClosingConfirmation()');
      webApp.enableClosingConfirmation();
      
      // Set state from window.Telegram.WebApp
      setState({
        user: webApp.initDataUnsafe?.user || null,
        isTelegram: true,
        isReady: true,
        theme: webApp.themeParams || {},
        viewport: {
          height: webApp.viewportHeight || window.innerHeight,
          width: webApp.viewportWidth || window.innerWidth,
          stableHeight: webApp.viewportHeight || window.innerHeight,
          isExpanded: webApp.isExpanded || true,
        },
        haptic: webApp.HapticFeedback || null,
        cloudStorage: webApp.CloudStorage || null,
        colorScheme: webApp.colorScheme || 'light',
        version: webApp.version || '',
        platform: webApp.platform || '',
      });

      console.log('[useTelegram] State set successfully');
      console.log('[useTelegram] =========================================');
    } catch (error) {
      console.error('[useTelegram] Error initializing Telegram WebApp:', error);
      // Browser fallback on error
      const fallback = createBrowserFallback();
      setState(fallback as any);
    }
  }, []);

  const expand = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      console.log('[useTelegram] Calling Telegram.WebApp.expand()');
      webApp.expand();
    }
  }, []);

  const close = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      console.log('[useTelegram] Calling Telegram.WebApp.close()');
      webApp.close();
    }
  }, []);

  const ready = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      console.log('[useTelegram] Calling Telegram.WebApp.ready()');
      webApp.ready();
    }
  }, []);

  const hapticImpact = useCallback((style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    if (state.haptic) {
      state.haptic.impactOccurred(style);
    }
  }, [state.haptic]);

  const hapticNotification = useCallback((type: 'error' | 'success' | 'warning') => {
    if (state.haptic) {
      state.haptic.notificationOccurred(type);
    }
  }, [state.haptic]);

  const hapticSelection = useCallback(() => {
    if (state.haptic) {
      state.haptic.selectionChanged();
    }
  }, [state.haptic]);

  const enableClosingConfirmation = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      console.log('[useTelegram] Calling Telegram.WebApp.enableClosingConfirmation()');
      webApp.enableClosingConfirmation();
    }
  }, []);

  const disableClosingConfirmation = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      console.log('[useTelegram] Calling Telegram.WebApp.disableClosingConfirmation()');
      webApp.disableClosingConfirmation();
    }
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
