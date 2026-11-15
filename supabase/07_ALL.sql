-- =====================================================================
-- 07_ALL.sql — كل الـ RLS policies فـ ملف واحد
-- شغّلو فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

-- ============ conversations ============
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view conversations" ON conversations;
CREATE POLICY "Users can view conversations" ON conversations
  FOR SELECT TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid());
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;
CREATE POLICY "Users can create conversations" ON conversations
  FOR INSERT TO authenticated WITH CHECK (participant_1 = auth.uid());
DROP POLICY IF EXISTS "Users can update conversations" ON conversations;
CREATE POLICY "Users can update conversations" ON conversations
  FOR UPDATE TO authenticated USING (participant_1 = auth.uid() OR participant_2 = auth.uid())
  WITH CHECK (participant_1 = auth.uid() OR participant_2 = auth.uid());

-- ============ messages ============
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages" ON messages;
CREATE POLICY "Users can view messages" ON messages
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id
    AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())));
DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- ============ comments ============
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own comments" ON comments;
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ bookmarks ============
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can add bookmarks" ON bookmarks;
CREATE POLICY "Users can add bookmarks" ON bookmarks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarks;
CREATE POLICY "Users can remove bookmarks" ON bookmarks
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ reactions ============
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view reactions" ON reactions;
CREATE POLICY "Users can view reactions" ON reactions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can add reactions" ON reactions;
CREATE POLICY "Users can add reactions" ON reactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own reactions" ON reactions;
CREATE POLICY "Users can update own reactions" ON reactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own reactions" ON reactions;
CREATE POLICY "Users can delete own reactions" ON reactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ stories ============
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view stories" ON stories;
CREATE POLICY "Users can view stories" ON stories FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users can add stories" ON stories;
CREATE POLICY "Users can add stories" ON stories
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ hashtags ============
ALTER TABLE hashtags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view hashtags" ON hashtags;
CREATE POLICY "Users can view hashtags" ON hashtags FOR SELECT TO authenticated USING (true);

-- ============ post_hashtags ============
ALTER TABLE post_hashtags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can add post_hashtags" ON post_hashtags;
CREATE POLICY "Users can add post_hashtags" ON post_hashtags FOR INSERT TO authenticated WITH CHECK (true);

-- =====================================================================
