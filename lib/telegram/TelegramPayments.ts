/**
 * Telegram Payments Service
 * Infrastructure for Telegram Stars payments
 */

export interface InvoiceParams {
  title: string;
  description: string;
  payload: string;
  currency: string;
  prices: Array<{
    label: string;
    amount: number;
  }>;
  provider_token?: string;
  photo_url?: string;
  photo_size?: number;
  photo_width?: number;
  photo_height?: number;
  need_name?: boolean;
  need_phone_number?: boolean;
  need_email?: boolean;
  need_shipping_address?: boolean;
  is_flexible?: boolean;
}

export interface InvoiceStatus {
  status: 'paid' | 'failed' | 'pending' | 'cancelled';
  invoice_id?: string;
  url?: string;
}

export class TelegramPayments {
  /**
   * Create an invoice for Telegram Stars payment
   */
  static createInvoice(params: InvoiceParams): string | null {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      console.error('Telegram WebApp not available');
      return null;
    }

    try {
      const invoice = window.Telegram.WebApp.createInvoice?.(params);
      return invoice || null;
    } catch (error) {
      console.error('Error creating invoice:', error);
      return null;
    }
  }

  /**
   * Open invoice link
   */
  static openInvoiceLink(url: string): void {
    if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
      console.error('Telegram WebApp not available');
      return;
    }

    window.Telegram.WebApp.openInvoice?.(url, (status: string) => {
      console.log('Invoice status:', status);
    });
  }

  /**
   * Show popup for payment confirmation
   */
  static showPopup(params: {
    title: string;
    message: string;
    buttons?: Array<{ type: 'default' | 'ok' | 'close' | 'cancel'; text?: string }>;
  }): Promise<string | null> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.error('Telegram WebApp not available');
        resolve(null);
        return;
      }

      window.Telegram.WebApp.showPopup?.(params, (buttonId: string | null) => {
        resolve(buttonId);
      }) || resolve(null);
    });
  }

  /**
   * Show alert message
   */
  static showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.Telegram?.WebApp) {
        console.error('Telegram WebApp not available');
        resolve();
        return;
      }

      window.Telegram.WebApp.showAlert?.(message, () => {
        resolve();
      }) || resolve();
    });
  }
}
