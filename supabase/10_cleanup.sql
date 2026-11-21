-- ============================================================
-- 10_cleanup.sql — حذف التكرار ديال المنشورات (keep newest)
-- شغّلها فـ Supabase SQL Editor
-- ============================================================

-- شحال قبل
SELECT count(*) AS before_count FROM posts;

-- حذف التكرار: خلي غير أحدث منشور لكل محتوى
DELETE FROM posts
WHERE id NOT IN (
  SELECT DISTINCT ON (content) id
  FROM posts
  ORDER BY content, created_at DESC
);

-- شحال من بعد
SELECT count(*) AS after_count FROM posts;
