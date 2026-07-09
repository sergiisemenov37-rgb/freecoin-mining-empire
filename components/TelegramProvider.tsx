/**
 * TelegramProvider Component
 * Initializes Telegram WebApp and provides authentication context
 */

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { getTelegramAuth } from '@/lib/telegram/TelegramAuth';

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const { isReady, isTelegram, user, ready, expand, enableClosingConfirmation } = useTelegram();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;

    // Initialize Telegram WebApp
    if (isTelegram) {
      ready();
      expand();
      enableClosingConfirmation();
    }

    // Authenticate user
    const authenticateUser = async () => {
      try {
        if (isTelegram && user) {
          // In Telegram, send initData to server for verification
          const initData = window.Telegram?.WebApp.initData;
          if (initData) {
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ initData }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                setIsAuthenticated(true);
                // Store session
                localStorage.setItem('telegram_session', JSON.stringify(data.session));
              }
            }
          }
        } else {
          // Browser mode - auto-authenticate with mock user
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check for existing session
    const existingSession = localStorage.getItem('telegram_session');
    if (existingSession) {
      try {
        const session = JSON.parse(existingSession);
        if (session && session.expiresAt > Date.now()) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        localStorage.removeItem('telegram_session');
      }
    }

    authenticateUser();
  }, [isReady, isTelegram, user, ready, expand, enableClosingConfirmation]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        fontSize: '18px',
      }}>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
