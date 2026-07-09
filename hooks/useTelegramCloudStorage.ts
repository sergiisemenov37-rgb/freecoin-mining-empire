/**
 * useTelegramCloudStorage Hook
 * Provides access to Telegram Cloud Storage
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTelegram } from './useTelegram';

export function useTelegramCloudStorage() {
  const { cloudStorage, isReady, isTelegram } = useTelegram();
  const [keys, setKeys] = useState<string[]>([]);

  const getKeys = useCallback(() => {
    return new Promise<string[]>((resolve) => {
      if (isTelegram && cloudStorage) {
        cloudStorage.getKeys((keys) => {
          setKeys(keys);
          resolve(keys);
        });
      } else {
        // Browser fallback - use localStorage
        const localKeys = Object.keys(localStorage);
        setKeys(localKeys);
        resolve(localKeys);
      }
    });
  }, [isTelegram, cloudStorage]);

  const getItems = useCallback(<T = any>(keys: string[]): Promise<Record<string, T>> => {
    return new Promise((resolve) => {
      if (isTelegram && cloudStorage) {
        cloudStorage.getItems(keys, (items) => {
          resolve(items as Record<string, T>);
        });
      } else {
        // Browser fallback - use localStorage
        const items: Record<string, T> = {};
        keys.forEach(key => {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              items[key] = JSON.parse(value) as T;
            } catch {
              items[key] = value as T;
            }
          }
        });
        resolve(items);
      }
    });
  }, [isTelegram, cloudStorage]);

  const setItem = useCallback(<T = any>(key: string, value: T): Promise<void> => {
    return new Promise((resolve) => {
      if (isTelegram && cloudStorage) {
        cloudStorage.setItems({ [key]: JSON.stringify(value) }, () => {
          resolve();
        });
      } else {
        // Browser fallback - use localStorage
        localStorage.setItem(key, JSON.stringify(value));
        resolve();
      }
    });
  }, [isTelegram, cloudStorage]);

  const removeItems = useCallback((keys: string[]): Promise<void> => {
    return new Promise((resolve) => {
      if (isTelegram && cloudStorage) {
        cloudStorage.removeItems(keys, () => {
          resolve();
        });
      } else {
        // Browser fallback - use localStorage
        keys.forEach(key => localStorage.removeItem(key));
        resolve();
      }
    });
  }, [isTelegram, cloudStorage]);

  useEffect(() => {
    if (isReady) {
      getKeys();
    }
  }, [isReady, getKeys]);

  return {
    keys,
    getKeys,
    getItems,
    setItem,
    removeItems,
    isReady,
    isTelegram,
  };
}
