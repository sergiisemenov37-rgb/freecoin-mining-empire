/**
 * Payment Types and Interfaces
 * Defines the structure for payment processing across all payment methods
 */

export enum PaymentMethod {
  TELEGRAM_STARS = 'telegram_stars',
  TON = 'ton',
  USDT = 'usdt',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export enum PaymentType {
  PURCHASE = 'purchase',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  SUBSCRIPTION = 'subscription',
}

export interface PaymentRequest {
  method: PaymentMethod;
  type: PaymentType;
  amount: number;
  currency: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  status: PaymentStatus;
  error?: string;
  redirectUrl?: string;
  transactionHash?: string;
}

export interface TelegramStarsPayment {
  stars: number;
  invoiceUrl?: string;
  payload?: string;
}

export interface TONPayment {
  address: string;
  amount: string; // in nanoTON
  message?: string;
  payload?: string;
}

export interface USDTPayment {
  jettonAddress: string;
  address: string;
  amount: string; // in smallest unit
  message?: string;
  payload?: string;
}

export interface PaymentTransaction {
  id: string;
  player_id: string;
  method: PaymentMethod;
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transaction_hash?: string;
  invoice_url?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
