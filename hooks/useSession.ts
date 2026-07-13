'use client';

import { useState, useEffect } from 'react';

interface Session {
  player_id: string;
  telegram_id: number;
  username: string;
  display_name: string;
  avatar: string | null;
  expiresAt: number;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session from localStorage
    const loadSession = () => {
      try {
        const sessionData = localStorage.getItem('telegram_session');
        if (sessionData) {
          const parsed = JSON.parse(sessionData);
          // Check if session is expired
          if (parsed.expiresAt > Date.now()) {
            setSession(parsed);
          } else {
            localStorage.removeItem('telegram_session');
          }
        }
      } catch (error) {
        console.error('Failed to load session:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'telegram_session') {
        loadSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { session, loading };
}
