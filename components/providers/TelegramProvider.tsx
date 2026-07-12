/**
 * TelegramProvider Component
 * Initializes Telegram WebApp using window.Telegram.WebApp API and provides authentication context
 */

'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useTelegram } from '@/hooks/useTelegram';
import { useTelegramTheme } from '@/hooks/useTelegramTheme';

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const { isReady, isTelegram, user } = useTelegram();
  useTelegramTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[TelegramProvider] =========================================');
    console.log('[TelegramProvider] Effect triggered, isReady:', isReady, 'isTelegram:', isTelegram);
    
    if (!isReady) {
      console.log('[TelegramProvider] Waiting for Telegram WebApp to be ready');
      return;
    }

    // Authenticate user
    const authenticateUser = async () => {
      console.log('[TelegramProvider] Starting authentication');
      try {
        if (isTelegram) {
          console.log('[TelegramProvider] Running in Telegram mode');
          
          // Use window.Telegram.WebApp.initData directly
          const webApp = (window as any).Telegram?.WebApp;
          
          if (!webApp) {
            console.error('[TelegramProvider] Telegram WebApp not available');
            alert('Telegram WebApp not available');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          console.log('[TelegramProvider] window.Telegram.WebApp.initData exists:', !!webApp.initData);
          console.log('[TelegramProvider] window.Telegram.WebApp.initData length:', webApp.initData?.length);
          
          const initData = webApp.initData;
          
          if (!initData) {
            console.error('[TelegramProvider] No initData available from window.Telegram.WebApp');
            console.log('[TelegramProvider] This is expected in some Telegram Desktop scenarios');
            console.log('[TelegramProvider] Attempting to use initDataUnsafe for authentication');
            
            // Try to use initDataUnsafe as fallback
            if (webApp.initDataUnsafe?.user) {
              console.log('[TelegramProvider] Using initDataUnsafe.user for basic auth');
              // Create a basic session without server validation
              const session = {
                telegram_id: webApp.initDataUnsafe.user.id,
                player_id: webApp.initDataUnsafe.user.id,
                username: webApp.initDataUnsafe.user.username || null,
                display_name: `${webApp.initDataUnsafe.user.first_name} ${webApp.initDataUnsafe.user.last_name || ''}`.trim() || webApp.initDataUnsafe.user.username || `User ${webApp.initDataUnsafe.user.id}`,
                avatar: webApp.initDataUnsafe.user.photo_url || null,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
              };
              
              console.log('[TelegramProvider] Basic session created:', session);
              localStorage.setItem('telegram_session', JSON.stringify(session));
              setIsAuthenticated(true);
              setIsLoading(false);
              return;
            } else {
              console.error('[TelegramProvider] No initDataUnsafe.user available either');
              alert('No Telegram authentication data available. Please try opening the app again.');
              setIsAuthenticated(false);
              setIsLoading(false);
              return;
            }
          }
          
          console.log('[AUTH] BEFORE FETCH');
          console.log('[TelegramProvider] Sending initData from window.Telegram.WebApp to API');
          const response = await fetch('/api/auth/telegram', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ initData }),
          });

          console.log('[AUTH] AFTER FETCH');
          console.log('[AUTH] STATUS', response.status);
          
          const responseText = await response.text();
          console.log('[AUTH] RESPONSE', responseText);
          
          if (!response.ok) {
            alert(
              'HTTP ' +
              response.status +
              '\n\n' +
              responseText
            );
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }
          
          const data = JSON.parse(responseText);
          console.log('[TelegramProvider] API response data:', data);
          
          if (data.success) {
            console.log('[TelegramProvider] Authentication successful');
            setIsAuthenticated(true);
            // Store session
            localStorage.setItem('telegram_session', JSON.stringify(data.session));
          } else {
            console.error('[TelegramProvider] API returned success=false:', data.error);
            alert('Authentication failed: ' + data.error);
            setIsAuthenticated(false);
          }
        } else {
          console.log('[TelegramProvider] Running in browser mode - auto-authenticating');
          // Browser mode - auto-authenticate (no server call needed)
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('[TelegramProvider] Authentication error:', error);
        alert('Authentication error: ' + (error as Error).stack || (error as Error).message);
        // Do not authenticate on error in Telegram mode
        if (!isTelegram) {
          console.log('[TelegramProvider] Browser mode error - still authenticating');
          setIsAuthenticated(true);
        } else {
          console.error('[TelegramProvider] Telegram mode error - authentication failed');
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
  }, [isReady, isTelegram, user]);

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
