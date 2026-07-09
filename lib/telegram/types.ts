/**
 * Telegram Mini Apps Types
 * Complete TypeScript types for Telegram WebApp integration
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitDataUnsafe {
  query_id?: string;
  user?: TelegramUser;
  auth_date?: number;
  hash?: string;
  start_param?: string;
  chat_type?: string;
  chat_instance?: string;
}

export interface TelegramInitData {
  [key: string]: string;
}

export interface TelegramThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface TelegramViewport {
  height: number;
  width: number;
  stableHeight: number;
  isExpanded: boolean;
}

export interface TelegramHaptic {
  impactOccurred(style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

export interface TelegramCloudStorage {
  getKeys(callback: (keys: string[]) => void): void;
  getItems(keys: string[], callback: (items: Record<string, string>) => void): void;
  setItems(items: Record<string, string>, callback: () => void): void;
  removeItems(keys: string[], callback: () => void): void;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: TelegramInitDataUnsafe;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: TelegramThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportWidth: number;
  headerColor: string;
  backgroundColor: string;
  
  expand(): void;
  close(): void;
  ready(): void;
  
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  
  BackButton: {
    show(): void;
    hide(): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
  };
  
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    
    setText(text: string): void;
    onClick(callback: () => void): void;
    offClick(callback: () => void): void;
    show(): void;
    hide(): void;
    enable(): void;
    disable(): void;
    showProgress(leaveActive?: boolean): void;
    hideProgress(): void;
    setParams(params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_visible?: boolean;
      is_active?: boolean;
    }): void;
  };
  
  HapticFeedback: TelegramHaptic;
  
  CloudStorage: TelegramCloudStorage;
  
  onEvent(eventType: string, callback: () => void): void;
  offEvent(eventType: string, callback: () => void): void;
}

export interface TelegramAuthData {
  telegram_id: number;
  username: string | null;
  first_name: string;
  last_name: string | null;
  language_code: string | null;
  photo_url: string | null;
  is_premium: boolean;
  auth_date: number;
  hash: string;
}

export interface TelegramPlayerData {
  telegram_id: number;
  username: string | null;
  display_name: string;
  avatar: string | null;
  language: string | null;
  last_login: Date;
}
