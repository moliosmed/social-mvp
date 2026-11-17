-- =====================================================================
-- 11_referrals.sql — نظام دعوة الأصدقاء (Referrals)
-- شغّلها فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);

ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
CREATE POLICY "Users can view own referrals" ON referrals
  FOR SELECT TO authenticated USING (auth.uid() = referrer_id);

DROP POLICY IF EXISTS "Users can add referrals" ON referrals;
CREATE POLICY "Users can add referrals" ON referrals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = referrer_id);
