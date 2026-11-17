-- =====================================================================
-- 10_paid_groups.sql — المجموعات المدفوعة (Paid Groups)
-- شغّلها فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

ALTER TABLE groups ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS price numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'MAD';

-- جدول مدفوعات المجموعات
CREATE TABLE IF NOT EXISTS group_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL,
  merchant_token text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_group_payments_user ON group_payments(user_id);

ALTER TABLE group_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own group payments" ON group_payments;
CREATE POLICY "Users can view own group payments" ON group_payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add group payments" ON group_payments;
CREATE POLICY "Users can add group payments" ON group_payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
