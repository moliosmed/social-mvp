-- =====================================================================
-- 04_bookmarks.sql
-- RLS policies ديال الـ Bookmarks (حفظ المنشورات)
-- شغّلها فـ Supabase Dashboard → SQL Editor → Run
-- =====================================================================

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bookmarks" ON bookmarks;
CREATE POLICY "Users can view own bookmarks" ON bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can add bookmarks" ON bookmarks;
CREATE POLICY "Users can add bookmarks" ON bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can remove bookmarks" ON bookmarks;
CREATE POLICY "Users can remove bookmarks" ON bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
