import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.moliosempire.com/privacy' },
  title: 'سياسة الخصوصية | Molios Empire',
  description: 'سياسة الخصوصية ديال Molios Empire — كيفاش كنجمعين، كنتخدمو، و كنحميو بياناتك.',
}

const SECTIONS = [
  { t: '1. البيانات اللي كنجمعو', d: 'كنجمع المعلومات اللي كاتعطينا ياها مباشر: الاسم، البريد الإلكتروني، كلمة المرور (مشفرة)، وصورة البروفايل. كنجمع حتى المحتوى اللي كاتشارك: المنشورات، التعليقات، والصور.' },
  { t: '2. كيفاش كنستعملوها', d: 'كنستعملو البيانات باش: (1) نوفرو الخدمة، (2) نحافظو على الحسابات، (3) نحسنو التجربة، (4) نواصلو معاك. ما كانبيعو بياناتك لأي طرف ثالث.' },
  { t: '3. كيفاش كنحميوها', d: 'كنستعملو تشفير SSL، مصادقة آمنة (Supabase)، و سياسات وصول صارمة (RLS). الخوادم عند Vercel و Supabase.' },
  { t: '4. حقوقك', d: 'عندك الحق تطلب نسخة من بياناتك، تصححها، أو تحذف حسابك كامل. التواصل: privacy@moliosempire.com' },
  { t: '5. كوكيز', d: 'كنستعملو كوكيز للجلسة و التفضيلات (الوضع الليلي، اللغة). يمكنك تحذفها من المتصفح.' },
  { t: '6. التغييرات', d: 'يمكن نحدّثو هاد السياسة. أي تغيير مهم غ يتواصلو معاك عبر البريد أو إشعار فالمنصة.' },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">🔒 سياسة الخصوصية</h1>
        <p className="text-gray-300">آخر تحديث: نونبر 2026</p>
      </header>
      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        {SECTIONS.map((s) => (
          <div key={s.t} className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-xl font-bold mb-3">{s.t}</h2>
            <p className="text-gray-300 leading-relaxed">{s.d}</p>
          </div>
        ))}
        <div className="text-center pt-8">
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition">
            سجل مجاناً 🚀
          </Link>
        </div>
      </section>
    </div>
  )
}
