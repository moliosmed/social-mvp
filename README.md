# 🌍 Molios Empire

![Molios Empire](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)

منصة تواصل اجتماعي عصرية، سريعة، ومتكاملة، مبنية بأحدث تقنيات الويب. تتيح للمستخدمين نشر الأفكار والصور، التفاعل مع المحتوى، وبناء شبكتهم الخاصة في وقت حقيقي (Real-time).

🔗 **الموقع الحي (Live Demo):** [www.moliosempire.com](https://www.moliosempire.com)

---

## ✨ الميزات الرئيسية

### المنتج
- 🔐 مصادقة Supabase (Auth)
- 📝 منشورات (نص + صورة) + تعديل + حذف
- 💬 تعليقات + ردود + تعديل + حذف
- 🎭 تفاعلات Emoji (👍❤️😂😮😢😡)
- 📊 استطلاعات (Polls)
- #️⃣ هاشتاجات + شائعة
- 📸 قصص (Stories)
- 👥 متابعة + اقتراحات + حظر
- 💬 رسائل فورية (Real-time)
- 🏘️ مجموعات (عامة / خاصة / مدفوعة)
- 🔔 إشعارات + صوت (Toast)
- 🏅 شارات و إنجازات
- 🔍 بحث + فلترة
- 🌐 i18n (العربية / English)
- 🌙 وضع ليلي
- 👤 بروفايل متكامل + إحصائيات
- 🎁 دعوة أصدقاء + مكافآت
- 🔗 SEO + OG image + sitemap

### الدخل (Monetization)
- 💳 **Premium** — 29.90 MAD/شهر (PayPal + PayZone)
- 🚀 **تعزيز المنشورات** — 10 / 30 / 50 MAD (PayZone)
- 📢 **إعلانات** للمستخدمين المجانيين
- 💰 **مجموعات مدفوعة**
- 🏢 **Landing B2B** — `/landing`
- 👑 **لوحة تحكم Admin** — `/admin`

---

## 🛠️ تقنيات البناء (Tech Stack)

- **Frontend:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL, Realtime, Storage, Auth)
- **Deployment:** Vercel
- **Icons:** Lucide React
- **Domain:** Custom `.com` domain with SSL & SEO optimization

---

## ⚠️ مهم — SQL

**لازم تشغّل [`supabase/07_ALL.sql`](supabase/07_ALL.sql)** فـ Supabase SQL Editor — فيه كل الـ RLS policies (محادثات، رسائل، تفاعلات، قصص، هاشتاج، تعزيز، إعلانات، مجموعات مدفوعة، دعوات).

---

## 📄 وثائق أخرى

- [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) — سيناريو فيديو تجريبي
- [`GROWTH_PLAYBOOK.md`](GROWTH_PLAYBOOK.md) — خطة نمو 30 يوم
- [`AGENTS.md`](AGENTS.md) — دليل المساهمة

---

## 🚀 كيفية تشغيل المشروع محلياً

1. استنساخ المستودع:
   ```bash
   git clone https://github.com/mohamedbennah3-art/social-mvp.git
   cd social-mvp