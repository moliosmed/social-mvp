-- ============================================================
-- Molios Empire — تفعيل Premium يدويا
-- (بعدما المستخدم كيPayy عن طريق PayPal.Me ولا bank transfer)
-- ============================================================

-- 1. بدل 'USER_UUID_HERE' بالـ id ديال المستخدم (من Authentication → Users)
UPDATE profiles
SET premium = true, premium_since = now()
WHERE id = 'USER_UUID_HERE';

-- 2. سجل الاشتراك
INSERT INTO premium_subscriptions (user_id, status, merchant_token, amount, currency, interval, current_period_end)
VALUES ('USER_UUID_HERE', 'active', 'manual', 29.90, 'MAD', 'month', now() + interval '30 days')
ON CONFLICT (user_id) DO UPDATE SET status = 'active', updated_at = now();

-- 3. إلغاء الـ Premium (إذا بغيتي)
-- UPDATE profiles SET premium = false WHERE id = 'USER_UUID_HERE';
