/**
 * Telegram Authentication Service
 * Server-side verification of Telegram initData
 */

import crypto from 'crypto';
import { TelegramAuthData, TelegramPlayerData } from './types';

export class TelegramAuth {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  /**
   * Verify Telegram initData signature
   * This ensures the data comes from Telegram and hasn't been tampered with
   */
  verifyInitData(initData: string): boolean {
    console.log('[TelegramAuth] Verifying initData signature');
    console.log('[TelegramAuth] initData length:', initData.length);
    try {
      const urlParams = new URLSearchParams(initData);
      const hash = urlParams.get('hash');
      
      console.log('[TelegramAuth] Hash present:', !!hash);
      console.log('[TelegramAuth] Hash value (first 10 chars):', hash?.substring(0, 10));
      
      if (!hash) {
        console.error('[TelegramAuth] No hash found in initData');
        return false;
      }

      // Remove hash from params for verification
      urlParams.delete('hash');

      // Log all parameters before sorting
      const allParams = Array.from(urlParams.entries());
      console.log('[TelegramAuth] All params count:', allParams.length);
      console.log('[TelegramAuth] All params keys:', allParams.map(([k]) => k).join(', '));

      // Sort parameters alphabetically
      const sortedParams = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b));

      console.log('[TelegramAuth] Sorted params count:', sortedParams.length);
      console.log('[TelegramAuth] Sorted params:', sortedParams.map(([k, v]) => `${k}=<${v.substring(0, 20)}...>`).join(', '));

      // Create data check string
      const dataCheckString = sortedParams
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      console.log('[TelegramAuth] Data check string length:', dataCheckString.length);
      console.log('[TelegramAuth] Data check string (first 100 chars):', dataCheckString.substring(0, 100));

      // Create HMAC-SHA256 signature
      console.log('[TelegramAuth] Creating secret key from bot token');
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(this.botToken)
        .digest();

      console.log('[TelegramAuth] Secret key created, length:', secretKey.length);

      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      console.log('[TelegramAuth] Computed signature length:', signature.length);
      console.log('[TelegramAuth] Computed signature (first 10 chars):', signature.substring(0, 10));
      console.log('[TelegramAuth] Received hash length:', hash.length);
      console.log('[TelegramAuth] Received hash (first 10 chars):', hash.substring(0, 10));

      // Compare signatures in constant time
      const isValid = this.constantTimeCompare(signature, hash);
      console.log('[TelegramAuth] Signature valid:', isValid);
      console.log('[TelegramAuth] Signature match:', signature === hash);
      
      if (!isValid) {
        console.error('[TelegramAuth] SIGNATURE VERIFICATION FAILED');
        console.error('[TelegramAuth] Expected:', signature);
        console.error('[TelegramAuth] Received:', hash);
      }
      
      return isValid;
    } catch (error) {
      console.error('[TelegramAuth] Error verifying Telegram initData:', error);
      return false;
    }
  }

  /**
   * Constant time comparison to prevent timing attacks
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Parse and validate Telegram initData
   */
  parseInitData(initData: string): TelegramAuthData | null {
    console.log('[TelegramAuth] Parsing initData');
    
    if (!this.verifyInitData(initData)) {
      console.error('[TelegramAuth] Signature verification failed');
      return null;
    }

    try {
      const urlParams = new URLSearchParams(initData);
      
      const userStr = urlParams.get('user');
      console.log('[TelegramAuth] User data present:', !!userStr);
      
      if (!userStr) {
        console.error('[TelegramAuth] No user data in initData');
        return null;
      }

      const user = JSON.parse(userStr);
      console.log('[TelegramAuth] Parsed user data, telegram_id:', user.id);

      const authData = {
        telegram_id: user.id,
        username: user.username || null,
        first_name: user.first_name,
        last_name: user.last_name || null,
        language_code: user.language_code || null,
        photo_url: user.photo_url || null,
        is_premium: user.is_premium || false,
        auth_date: parseInt(urlParams.get('auth_date') || '0'),
        hash: urlParams.get('hash') || '',
      };
      
      console.log('[TelegramAuth] Auth data parsed successfully:', authData);
      return authData;
    } catch (error) {
      console.error('[TelegramAuth] Error parsing Telegram initData:', error);
      return null;
    }
  }

  /**
   * Convert Telegram auth data to player data format
   */
  toPlayerData(authData: TelegramAuthData): TelegramPlayerData {
    const displayName = [authData.first_name, authData.last_name]
      .filter(Boolean)
      .join(' ') || authData.username || `User ${authData.telegram_id}`;

    return {
      telegram_id: authData.telegram_id,
      username: authData.username,
      display_name: displayName,
      avatar: authData.photo_url,
      language: authData.language_code,
      last_login: new Date(),
    };
  }

  /**
   * Validate auth date is recent (within 24 hours)
   */
  isAuthDateValid(authDate: number): boolean {
    const now = Math.floor(Date.now() / 1000);
    const maxAge = 24 * 60 * 60; // 24 hours in seconds
    return now - authDate < maxAge;
  }
}

// Singleton instance
let telegramAuthInstance: TelegramAuth | null = null;

export function getTelegramAuth(): TelegramAuth {
  if (!telegramAuthInstance) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    console.log('[TelegramAuth] TELEGRAM_BOT_TOKEN present:', !!botToken);
    console.log('[TelegramAuth] TELEGRAM_BOT_TOKEN length:', botToken?.length || 0);
    if (!botToken) {
      console.error('[TelegramAuth] TELEGRAM_BOT_TOKEN environment variable is not set');
      throw new Error('TELEGRAM_BOT_TOKEN environment variable is not set');
    }
    telegramAuthInstance = new TelegramAuth(botToken);
    console.log('[TelegramAuth] TelegramAuth instance created successfully');
  }
  return telegramAuthInstance;
}
