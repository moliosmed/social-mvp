-- ============================================================
-- Molios Empire — Premium subscriptions (PayZone)
-- ============================================================

-- 1. Add premium flag to profiles (fast lookup)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS premium boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS premium_since timestamptz;

-- 2. Subscriptions table
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_token text,
  subscription_id text,
  status text NOT NULL DEFAULT 'pending',      -- pending | active | canceled | expired
  amount numeric(10,2) NOT NULL DEFAULT 29.90,
  currency text NOT NULL DEFAULT 'MAD',
  interval text NOT NULL DEFAULT 'month',      -- month | year
  current_period_end timestamptz,
  payzone_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_premium_sub_user ON premium_subscriptions(user_id);

ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription
CREATE POLICY "Users can view their own premium subscription"
ON premium_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Only the service role (API) can insert/update
CREATE POLICY "Service role manages premium subscriptions"
ON premium_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
