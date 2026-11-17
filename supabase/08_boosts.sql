-- =====================================================================
-- 08_boosts.sql — تعزيز المنشورات (Boosted Posts)
-- شغّلها فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

-- 1. عمود التعزيز على المنشورات
ALTER TABLE posts ADD COLUMN IF NOT EXISTS boosted_until timestamptz;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS boost_views integer NOT NULL DEFAULT 0;

-- 2. جدول التعزيزات (tracking)
CREATE TABLE IF NOT EXISTS boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL,                -- 24h | 72h | 7d
  amount numeric(10,2) NOT NULL,
  merchant_token text,
  status text NOT NULL DEFAULT 'pending',  -- pending | active | expired
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_boosts_post ON boosts(post_id);

ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own boosts" ON boosts;
CREATE POLICY "Users can view own boosts" ON boosts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add boosts" ON boosts;
CREATE POLICY "Users can add boosts" ON boosts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
