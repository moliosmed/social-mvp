-- =====================================================================
-- 06_stories.sql
-- RLS policies ديال القصص (Stories)
-- شغّلها فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view stories" ON stories;
CREATE POLICY "Users can view stories" ON stories
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can add stories" ON stories;
CREATE POLICY "Users can add stories" ON stories
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
