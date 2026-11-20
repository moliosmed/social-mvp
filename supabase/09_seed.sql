-- ============================================================
-- 09_seed.sql — منشورات البذرة (seed) ديال Molios Empire
-- شغّلها فـ Supabase SQL Editor (مرة واحدة)
-- ============================================================

INSERT INTO posts (user_id, content, created_at) VALUES
('f17bb09e-b181-44f3-8e17-1f67fe5b19e7', '🌍 مرحبا بكم فـ Molios Empire — الشبكة الاجتماعية العربية المغربية الأولى!

منشورات · تفاعلات · رسائل فورية · مجموعات · هاشتاجات · استطلاعات · قصص.
انضم مجاناً: moliosempire.com', now() - interval '1 day'),

('200a6cb8-8ddc-44ad-a2d6-805136db8e9e', '💡 5 نصائح باش تربح من السوشيال ميديا:
1. اختار مجال و بقّيه
2. المحتوى أولاً
3. تفاعل مع المتابعين
4. انتظم
5. استعمل المنصات الذكية
زيد معرفتك: moliosempire.com/blog', now() - interval '2 day'),

('f17bb09e-b181-44f3-8e17-1f67fe5b19e7', '🚀 إطلاق Molios Empire! شبكة اجتماعية عربية بالدار العربية، تصميم عصري، و تفاعل فوري.
جرّب دابا: moliosempire.com', now() - interval '3 day'),

('12e4565d-73c9-4206-8622-6cee382d86ee', '🛒 التجارة الإلكترونية فالمغرب كبرات بزاف. دابا وقت باش تبدا مشروعك!
دليل كامل: moliosempire.com/blog/ecommerce-morocco', now() - interval '4 day'),

('29a9869c-d5b5-4832-bab9-c1a21a0c6b23', '⚡ جرّبت الـ تفاعلات emoji ديال Molios Empire؟ واحد الرياكت بلا تحديث الصفحة.
جرب دابا: moliosempire.com', now() - interval '5 day'),

('200a6cb8-8ddc-44ad-a2d6-805136db8e9e', '🎁 كل 3 دعوات = 7 أيام Premium مجاناً!
دع أصدقاءك: moliosempire.com/?ref=moliosempire', now() - interval '6 day'),

('f17bb09e-b181-44f3-8e17-1f67fe5b19e7', '📱 قصص، استطلاعات، مجموعات، شارات، رسائل فورية... كل شي فـ Molios Empire.
اكتشف: moliosempire.com', now() - interval '7 day'),

('c44ef26a-4453-48b8-89bb-2a256b08a44b', '🇲🇦 منصة عربية بجذور مغربية. فخورين بنبناء هادشي معا.
انضم: moliosempire.com', now() - interval '8 day');

-- تحقق
SELECT count(*) AS posts_count FROM posts;
