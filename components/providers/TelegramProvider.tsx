/**
 * TelegramProvider Component
 * Initializes Telegram WebApp and provides authentication context
 */

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramTheme } from '@/hooks/useTelegramTheme';

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const { isReady, isTelegram, user, ready, expand, enableClosingConfirmation } = useTelegram();
  useTelegramTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[TelegramProvider] Effect triggered, isReady:', isReady, 'isTelegram:', isTelegram);
    
    if (!isReady) {
      console.log('[TelegramProvider] Waiting for Telegram SDK to be ready');
      return;
    }

    // Initialize Telegram WebApp
    if (isTelegram) {
      console.log('[TelegramProvider] Initializing Telegram WebApp');
      ready();
      expand();
      enableClosingConfirmation();
    }

    // Authenticate user
    const authenticateUser = async () => {
      console.log('[TelegramProvider] Starting authentication');
      try {
        if (isTelegram) {
          console.log('[TelegramProvider] Running in Telegram mode');
          // In Telegram, send initData to server for verification
          const initData = window.Telegram?.WebApp.initData;
          console.log('[TelegramProvider] initData exists:', !!initData, 'length:', initData?.length);
          
          if (initData) {
            console.log('[TelegramProvider] Sending initData to API');
            const response = await fetch('/api/auth/telegram', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ initData }),
            });

            console.log('[TelegramProvider] API response status:', response.status);
            
            if (response.ok) {
              const data = await response.json();
              console.log('[TelegramProvider] API response data:', data);
              
              if (data.success) {
                console.log('[TelegramProvider] Authentication successful');
                setIsAuthenticated(true);
                // Store session
                localStorage.setItem('telegram_session', JSON.stringify(data.session));
              } else {
                console.error('[TelegramProvider] API returned success=false:', data.error);
                // Do not allow access on auth failure
                setIsAuthenticated(false);
              }
            } else {
              console.error('[TelegramProvider] API request failed:', response.status, response.statusText);
              setIsAuthenticated(false);
            }
          } else {
            console.error('[TelegramProvider] No initData available in Telegram mode');
            setIsAuthenticated(false);
          }
        } else {
          console.log('[TelegramProvider] Running in browser mode - auto-authenticating');
          // Browser mode - auto-authenticate (no server call needed)
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('[TelegramProvider] Authentication error:', error);
        // Do not authenticate on error in Telegram mode
        if (!isTelegram) {
          console.log('[TelegramProvider] Browser mode error - still authenticating');
          setIsAuthenticated(true);
        } else {
          console.error('[TelegramProvider] Telegram режим error - authentication failed');
          setIsAuthenticated(false);
        }
      } finally {
        console.log('[TelegramProvider] Authentication flow complete, isLoading:', false);
        setIsLoading(false);
      }
    };

    // Check for existing session
    const existingSession = localStorage.getItem('telegram_session');
    console.log('[TelegramProvider] Existing session found:', !!existingSession);
    
    if (existingSession) {
      try {
        const session = JSON.parse(existingSession);
        console.log('[TelegramProvider] Session data:', session);
        
        if (session && session.expiresAt > Date.now()) {
          console.log('[TelegramProvider] Session valid, using cached authentication');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        } else {
          console.log('[TelegramProvider] Session expired, removing');
          localStorage.removeItem('telegram_session');
        }
      } catch (error) {
        console.error('[TelegramProvider] Session parse error:', error);
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

  if (!isAuthenticated && isTelegram) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a1a2e',
        color: '#ffffff',
        fontSize: '18px',
        padding: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          backgroundColor: '#ef4444',
          color: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          maxWidth: '400px',
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Authentication Failed</h2>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            Unable to verify your Telegram account. Please try again later or contact support.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
