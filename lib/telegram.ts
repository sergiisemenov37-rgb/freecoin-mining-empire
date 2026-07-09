'use client';

import { useEffect } from 'react';
import { init, retrieveLaunchParams } from '@telegram-apps/sdk-react';

export const useTelegramInit = () => {
  useEffect(() => {
    try {
      // Check if we're in Telegram environment
      const launchParams = retrieveLaunchParams();
      if (launchParams) {
        init();
        console.log('Telegram Mini App initialized successfully');
      } else {
        console.log('Running outside Telegram - skipping initialization');
      }
    } catch (error) {
      console.log('Running outside Telegram environment:', error);
    }
  }, []);
};
