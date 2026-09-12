-- Haven Escrow Table
-- Run this in your Supabase SQL editor to create the schema.

CREATE TABLE IF NOT EXISTS escrows (
  id TEXT PRIMARY KEY,
  contract_address TEXT NOT NULL,
  buyer_address TEXT NOT NULL,
  seller_address TEXT NOT NULL,
  amount TEXT NOT NULL,
  condition TEXT NOT NULL,
  state INTEGER NOT NULL DEFAULT 0,
  state_label TEXT NOT NULL DEFAULT 'Created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  funded_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  disputed_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  transaction_hash TEXT,
  buyer_secret TEXT NOT NULL,
  seller_secret TEXT NOT NULL,
  salt TEXT NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_escrows_state ON escrows(state);
CREATE INDEX IF NOT EXISTS idx_escrows_buyer ON escrows(buyer_address);
CREATE INDEX IF NOT EXISTS idx_escrows_seller ON escrows(seller_address);
CREATE INDEX IF NOT EXISTS idx_escrows_created ON escrows(created_at DESC);

-- Row Level Security
ALTER TABLE escrows ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (auth can be added later)
CREATE POLICY "Allow all operations" ON escrows FOR ALL USING (true);
