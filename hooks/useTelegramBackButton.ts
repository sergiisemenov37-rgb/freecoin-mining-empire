/**
 * useTelegramBackButton Hook
 * Controls Telegram Back Button visibility and behavior
 * Uses official SDK where possible
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';
import '@/types/telegram';

export function useTelegramBackButton() {
  const { isTelegram, isReady } = useTelegram();

  const show = useCallback(() => {
    if (isTelegram && (window as any).Telegram?.WebApp?.BackButton) {
      (window as any).Telegram.WebApp.BackButton.show();
    }
  }, [isTelegram]);

  const hide = useCallback(() => {
    if (isTelegram && (window as any).Telegram?.WebApp?.BackButton) {
      (window as any).Telegram.WebApp.BackButton.hide();
    }
  }, [isTelegram]);

  const onClick = useCallback((callback: () => void) => {
    if (isTelegram && (window as any).Telegram?.WebApp?.BackButton) {
      (window as any).Telegram.WebApp.BackButton.onClick(callback);
    }
  }, [isTelegram]);

  const offClick = useCallback((callback: () => void) => {
    if (isTelegram && (window as any).Telegram?.WebApp?.BackButton) {
      (window as any).Telegram.WebApp.BackButton.offClick(callback);
    }
  }, [isTelegram]);

  return { show, hide, onClick, offClick, isReady, isTelegram };
}
