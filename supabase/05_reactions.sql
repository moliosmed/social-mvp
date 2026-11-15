-- =====================================================================
-- 05_reactions.sql
-- RLS policies ديال التفاعلات (Emoji Reactions)
-- شغّلها فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view reactions" ON reactions;
CREATE POLICY "Users can view reactions" ON reactions
  FOR SELECT TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can add reactions" ON reactions;
CREATE POLICY "Users can add reactions" ON reactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reactions" ON reactions;
CREATE POLICY "Users can update own reactions" ON reactions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;
CREATE POLICY "Users can delete own reactions" ON reactions
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
