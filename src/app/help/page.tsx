import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.moliosempire.com/help' },
  title: 'مركز المساعدة | Molios Empire — أسئلة شائعة و أدلة',
  description: 'مركز المساعدة ديال Molios Empire — أجوبة على الأسئلة الشائعة و كيفاش تخدم المنصة.',
}

const FAQS = [
  { q: 'كيفاش نسجل؟', a: 'افتح moliosempire.com، ضرب "سجل الآن"، و دخل بريدك الإلكتروني. غ يوصلوك رابط التأكيد.' },
  { q: 'كيفاش ننشر منشور؟', a: 'من الصفحة الرئيسية، كتب فالمربع، زد صورة (اختياري)، و ضرب "نشر".' },
  { q: 'كيفاش نبدل البروفايل؟', a: 'دخل لصفحة البروفايل، ضرب "تعديل"، و بدّل الاسم، الصورة، أو النبذة.' },
  { q: 'كيفاش نحذف الحساب؟', a: 'من البروفايل → إعدادات → حذف الحساب. هاد العملية ما يمكنش التراجع عليها.' },
  { q: 'كيفاش نستعمل الوضع الليلي؟', a: 'من الشريط العلوي، اضغط على أيقونة القمر 🌙.' },
  { q: 'كيفاش نغير اللغة؟', a: 'من الشريط العلوي، بدّل بين العربية و English.' },
  { q: 'كيفاش نتعاون معاك؟', a: 'أرسل لنا على mohamedbennah1@gmail.com' },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-blue-600/20 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
          💬 مركز المساعدة
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">كيفاش نقدرو نعاونوك؟</h1>
        <p className="text-gray-300">أجوبة على الأسئلة الشائعة.</p>
      </header>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-4">
        {FAQS.map((f) => (
          <details key={f.q} className="bg-gray-800/60 rounded-2xl p-6 border border-gray-700 group">
            <summary className="font-bold text-lg cursor-pointer list-none flex justify-between items-center">
              {f.q}
              <span className="text-blue-400 group-open:rotate-45 transition">+</span>
            </summary>
            <p className="text-gray-300 mt-3 leading-relaxed">{f.a}</p>
          </details>
        ))}

        <div className="text-center bg-blue-600/20 rounded-2xl p-10 border border-blue-500/30 mt-10">
          <h2 className="text-2xl font-bold mb-4">باقي عندك شي سؤال؟</h2>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition">
            سجل مجاناً 🚀
          </Link>
        </div>
      </section>
    </div>
  )
}
