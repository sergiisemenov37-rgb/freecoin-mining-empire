/**
 * useTelegramTheme Hook
 * Applies Telegram theme colors to the application
 */

'use client';

import { useEffect } from 'react';
import { useTelegram } from './useTelegram';

export function useTelegramTheme() {
  const { theme, colorScheme, isReady } = useTelegram();

  useEffect(() => {
    if (!isReady) return;

    const root = document.documentElement;

    // Apply Telegram theme colors as CSS variables
    if (theme.bg_color) {
      root.style.setProperty('--tg-theme-bg-color', theme.bg_color);
      root.style.setProperty('--background', theme.bg_color);
    }

    if (theme.text_color) {
      root.style.setProperty('--tg-theme-text-color', theme.text_color);
      root.style.setProperty('--foreground', theme.text_color);
    }

    if (theme.hint_color) {
      root.style.setProperty('--tg-theme-hint-color', theme.hint_color);
    }

    if (theme.link_color) {
      root.style.setProperty('--tg-theme-link-color', theme.link_color);
      root.style.setProperty('--primary', theme.link_color);
    }

    if (theme.button_color) {
      root.style.setProperty('--tg-theme-button-color', theme.button_color);
    }

    if (theme.button_text_color) {
      root.style.setProperty('--tg-theme-button-text-color', theme.button_text_color);
    }

    if (theme.secondary_bg_color) {
      root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondary_bg_color);
    }

    // Apply color scheme
    root.style.setProperty('--color-scheme', colorScheme);
  }, [theme, colorScheme, isReady]);

  return { theme, colorScheme };
}
