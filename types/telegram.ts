/**
 * Telegram WebApp Type Definitions
 * Shared across all Telegram-related hooks
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
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
  impactOccurred: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
  selectionChanged: () => void;
}

export interface TelegramCloudStorage {
  getKeys: (callback: (keys: string[]) => void) => void;
  getItems: (keys: string[], callback: (items: Record<string, string>) => void) => void;
  setItems: (items: Record<string, string>, callback: () => void) => void;
  removeItems: (keys: string[], callback: () => void) => void;
}

export interface TelegramState {
  user: TelegramUser | null;
  isTelegram: boolean;
  isReady: boolean;
  theme: TelegramThemeParams;
  viewport: TelegramViewport;
  haptic: TelegramHaptic | null;
  cloudStorage: TelegramCloudStorage | null;
  colorScheme: 'light' | 'dark';
  version: string;
  platform: string;
}

export interface TelegramActions {
  expand: () => void;
  close: () => void;
  ready: () => void;
  hapticImpact: (style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
  hapticNotification: (type: 'error' | 'success' | 'warning') => void;
  hapticSelection: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: TelegramUser;
          query_id?: string;
          auth_date?: number;
          hash?: string;
          start_param?: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: TelegramThemeParams;
        isExpanded: boolean;
        viewportHeight: number;
        viewportWidth: number;
        headerColor: string;
        backgroundColor: string;
        expand: () => void;
        close: () => void;
        ready: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        HapticFeedback: TelegramHaptic;
        CloudStorage: TelegramCloudStorage;
        BackButton?: {
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: any) => void;
        };
        createInvoice?: (params: any) => string;
        openInvoice?: (url: string, callback: (status: string) => void) => void;
        showPopup?: (params: any, callback: (buttonId: string | null) => void) => void;
        showAlert?: (message: string, callback: () => void) => void;
      };
    };
  }
}
