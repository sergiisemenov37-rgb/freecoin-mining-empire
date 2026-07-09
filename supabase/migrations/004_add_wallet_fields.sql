-- Add wallet fields to players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS wallet_name TEXT,
ADD COLUMN IF NOT EXISTS wallet_connected_at TIMESTAMPTZ;

-- Create index for wallet address
CREATE INDEX IF NOT EXISTS idx_players_wallet_address ON players(wallet_address) WHERE wallet_address IS NOT NULL;

-- Add comment
COMMENT ON COLUMN players.wallet_address IS 'TON Connect wallet address';
COMMENT ON COLUMN players.wallet_name IS 'TON Connect wallet name (e.g., Tonkeeper, Telegram Wallet)';
COMMENT ON COLUMN players.wallet_connected_at IS 'Timestamp when wallet was connected';
