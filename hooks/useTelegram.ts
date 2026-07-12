/**
 * useTelegram React Hook
 * Provides Telegram WebApp functionality using official @telegram-apps/sdk-react
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

interface TelegramViewport {
  height: number;
  width: number;
  stableHeight: number;
  isExpanded: boolean;
}

interface TelegramHaptic {
  impactOccurred: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

interface TelegramCloudStorage {
  getKeys: (callback: (keys: string[]) => void) => void;
  getItems: (keys: string[], callback: (items: Record<string, string>) => void) => void;
  setItems: (items: Record<string, string>, callback: () => void) => void;
  removeItems: (keys: string[], callback: () => void) => void;
}

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

  useEffect(() => {
    try {
      // Use official SDK to retrieve launch parameters
      const launchParams = retrieveLaunchParams();
      
      console.log('[useTelegram] Official SDK launch params retrieved:', !!launchParams);
      
      // Check if running in Telegram
      const isTelegramApp = !!launchParams;
      
      if (!isTelegramApp) {
        // Browser fallback
        const fallback = createBrowserFallback();
        setState(fallback as any);
        return;
      }

      // Access Telegram WebApp through the official SDK
      // The SDK provides access to the WebApp instance
      const webApp = (window as any).Telegram?.WebApp;
      
      if (!webApp) {
        console.error('[useTelegram] Telegram WebApp not available despite launch params');
        const fallback = createBrowserFallback();
        setState(fallback as any);
        return;
      }

      // Initialize Telegram WebApp using official SDK
      webApp.ready();
      webApp.expand();
      webApp.enableClosingConfirmation();

      // Set initial state from official SDK
      setState({
        user: (launchParams as any).initDataUnsafe?.user || null,
        isTelegram: true,
        isReady: true,
        theme: webApp.themeParams,
        viewport: {
          height: webApp.viewportHeight,
          width: webApp.viewportWidth,
          stableHeight: webApp.viewportHeight,
          isExpanded: webApp.isExpanded,
        },
        haptic: webApp.HapticFeedback || null,
        cloudStorage: webApp.CloudStorage || null,
        colorScheme: webApp.colorScheme,
        version: webApp.version,
        platform: webApp.platform,
      });

      // Listen for viewport changes
      const handleViewportChange = () => {
        setState(prev => ({
          ...prev,
          viewport: {
            height: webApp.viewportHeight,
            width: webApp.viewportWidth,
            stableHeight: webApp.viewportHeight,
            isExpanded: webApp.isExpanded,
          },
        }));
      };

      window.addEventListener('resize', handleViewportChange);

      return () => {
        window.removeEventListener('resize', handleViewportChange);
      };
    } catch (error) {
      console.error('[useTelegram] Error initializing Telegram SDK:', error);
      // Browser fallback on error
      const fallback = createBrowserFallback();
      setState(fallback as any);
    }
  }, []);

  const expand = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      webApp.expand();
    }
  }, []);

  const close = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
      webApp.close();
    }
  }, []);

  const ready = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
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
      webApp.enableClosingConfirmation();
    }
  }, []);

  const disableClosingConfirmation = useCallback(() => {
    const webApp = (window as any).Telegram?.WebApp;
    if (webApp) {
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
