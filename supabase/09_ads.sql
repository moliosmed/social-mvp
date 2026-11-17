-- =====================================================================
-- 09_ads.sql — الإعلانات (للمستخدمين المجانيين)
-- شغّلها فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_url text,
  link_url text,
  cta text DEFAULT 'اكتشف المزيد',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view active ads" ON ads;
CREATE POLICY "Users can view active ads" ON ads
  FOR SELECT TO authenticated USING (true);

-- إعلان تجريبي (можно تعديلو ولا حذفو)
INSERT INTO ads (title, image_url, link_url, cta)
VALUES (
  'Molios Empire Premium — بدون إعلانات',
  NULL,
  'https://www.moliosempire.com/pricing',
  'جرّب Premium'
)
ON CONFLICT DO NOTHING;
