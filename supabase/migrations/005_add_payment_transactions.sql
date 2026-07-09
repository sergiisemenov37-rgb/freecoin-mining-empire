-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('telegram_stars', 'ton', 'usdt')),
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deposit', 'withdrawal', 'subscription')),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  transaction_hash TEXT,
  invoice_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_player_id ON payment_transactions(player_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_method ON payment_transactions(method);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_hash ON payment_transactions(transaction_hash) WHERE transaction_hash IS NOT NULL;

-- Add comments
COMMENT ON TABLE payment_transactions IS 'Payment transactions for all payment methods';
COMMENT ON COLUMN payment_transactions.method IS 'Payment method: telegram_stars, ton, usdt';
COMMENT ON COLUMN payment_transactions.type IS 'Payment type: purchase, deposit, withdrawal, subscription';
COMMENT ON COLUMN payment_transactions.status IS 'Payment status: pending, processing, completed, failed, refunded, cancelled';
COMMENT ON COLUMN payment_transactions.transaction_hash IS 'Blockchain transaction hash for TON/USDT payments';
COMMENT ON COLUMN payment_transactions.invoice_url IS 'Invoice URL for Telegram Stars payments';
