/**
 * useTelegram React Hook
 * Provides Telegram WebApp functionality and browser fallback
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TelegramUser, 
  TelegramThemeParams, 
  TelegramViewport, 
  TelegramHaptic,
  TelegramCloudStorage 
} from '@/lib/telegram/types';

interface TelegramState {
  user: TelegramUser | null;
  isTelegram: boolean;
  isReady: boolean;
  theme: TelegramThemeParams;
  viewport: TelegramViewport;
  haptic: TelegramHaptic | null;
  cloudStorage: TelegramCloudStorage | null;
  colorScheme: 'light' | 'dark';
  version: string;
  platform: string;
}

interface TelegramActions {
  expand: () => void;
  close: () => void;
  ready: () => void;
  hapticImpact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  hapticNotification: (type: 'error' | 'success' | 'warning') => void;
  hapticSelection: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          query_id?: string;
          auth_date?: number;
          hash?: string;
          start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: TelegramThemeParams;
        isExpanded: boolean;
        viewportHeight: number;
        viewportWidth: number;
        headerColor: string;
        backgroundColor: string;
        expand: () => void;
        close: () => void;
        ready: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        HapticFeedback: TelegramHaptic;
        CloudStorage: TelegramCloudStorage;
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: any) => void;
        };
        createInvoice?: (params: any) => string;
        openInvoice?: (url: string, callback: (status: string) => void) => void;
        showPopup?: (params: any, callback: (buttonId: string | null) => void) => void;
        showAlert?: (message: string, callback: () => void) => void;
      };
    };
  }
}

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

  const [webApp, setWebApp] = useState<any>(null);

  useEffect(() => {
    // Check if running in Telegram
    const isTelegramApp = typeof window !== 'undefined' && window.Telegram?.WebApp;

    if (!isTelegramApp) {
      // Browser fallback
      const fallback = createBrowserFallback();
      setState(fallback as any);
      return;
    }

    const tg = window.Telegram!.WebApp;
    setWebApp(tg);

    // Initialize Telegram WebApp
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();

    // Set initial state
    setState({
      user: tg.initDataUnsafe.user || null,
      isTelegram: true,
      isReady: true,
      theme: tg.themeParams,
      viewport: {
        height: tg.viewportHeight,
        width: tg.viewportWidth,
        stableHeight: tg.viewportHeight,
        isExpanded: tg.isExpanded,
      },
      haptic: tg.HapticFeedback || null,
      cloudStorage: tg.CloudStorage || null,
      colorScheme: tg.colorScheme,
      version: tg.version,
      platform: tg.platform,
    });

    // Listen for viewport changes
    const handleViewportChange = () => {
      setState(prev => ({
        ...prev,
        viewport: {
          height: tg.viewportHeight,
          width: tg.viewportWidth,
          stableHeight: tg.viewportHeight,
          isExpanded: tg.isExpanded,
        },
      }));
    };

    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  const expand = useCallback(() => {
    if (webApp) {
      webApp.expand();
    }
  }, [webApp]);

  const close = useCallback(() => {
    if (webApp) {
      webApp.close();
    }
  }, [webApp]);

  const ready = useCallback(() => {
    if (webApp) {
      webApp.ready();
    }
  }, [webApp]);

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
    if (webApp) {
      webApp.enableClosingConfirmation();
    }
  }, [webApp]);

  const disableClosingConfirmation = useCallback(() => {
    if (webApp) {
      webApp.disableClosingConfirmation();
    }
  }, [webApp]);

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
