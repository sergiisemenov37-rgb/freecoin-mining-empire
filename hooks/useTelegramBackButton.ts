/**
 * useTelegramBackButton Hook
 * Controls Telegram Back Button visibility and behavior
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTelegram } from './useTelegram';

export function useTelegramBackButton() {
  const { isTelegram, isReady } = useTelegram();

  const show = useCallback(() => {
    if (isTelegram && window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.show();
    }
  }, [isTelegram]);

  const hide = useCallback(() => {
    if (isTelegram && window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
    }
  }, [isTelegram]);

  const onClick = useCallback((callback: () => void) => {
    if (isTelegram && window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.onClick(callback);
    }
  }, [isTelegram]);

  const offClick = useCallback((callback: () => void) => {
    if (isTelegram && window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.offClick(callback);
    }
  }, [isTelegram]);

  return { show, hide, onClick, offClick, isReady, isTelegram };
}
