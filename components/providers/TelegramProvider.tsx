'use client';

import { useEffect } from 'react';
import { useTelegramInit } from '@/lib/telegram';

export const TelegramProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useTelegramInit();

  return <>{children}</>;
};
