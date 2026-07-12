/**
 * useTelegramMainButton Hook
 * Controls Telegram Main Button visibility and behavior
 * Uses official SDK where possible
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';
import '@/types/telegram';

export function useTelegramMainButton() {
  const { isTelegram, isReady } = useTelegram();

  const show = useCallback(() => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.show();
    }
  }, [isTelegram]);

  const hide = useCallback(() => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.hide();
    }
  }, [isTelegram]);

  const setText = useCallback((text: string) => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.setText(text);
    }
  }, [isTelegram]);

  const onClick = useCallback((callback: () => void) => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.onClick(callback);
    }
  }, [isTelegram]);

  const offClick = useCallback((callback: () => void) => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.offClick(callback);
    }
  }, [isTelegram]);

  const enable = useCallback(() => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.enable();
    }
  }, [isTelegram]);

  const disable = useCallback(() => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.disable();
    }
  }, [isTelegram]);

  const showProgress = useCallback((leaveActive = false) => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.showProgress(leaveActive);
    }
  }, [isTelegram]);

  const hideProgress = useCallback(() => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.hideProgress();
    }
  }, [isTelegram]);

  const setParams = useCallback((params: {
    text?: string;
    color?: string;
    text_color?: string;
    is_visible?: boolean;
    is_active?: boolean;
  }) => {
    if (isTelegram && (window as any).Telegram?.WebApp?.MainButton) {
      (window as any).Telegram.WebApp.MainButton.setParams(params);
    }
  }, [isTelegram]);

  setText('Continue');

  return {
    show,
    hide,
    setText,
    onClick,
    offClick,
    enable,
    disable,
    showProgress,
    hideProgress,
    setParams,
    isReady,
    isTelegram,
  };
}
