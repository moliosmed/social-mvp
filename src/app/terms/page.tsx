import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'شروط الاستخدام | Molios Empire',
  description: 'شروط الاستخدام ديال Molios Empire — القواعد اللي كتحكم استخدام المنصة.',
}

const SECTIONS = [
  { t: '1. القبول', d: 'باستخدامك Molios Empire، أنت كاتقبل هاد الشروط. إلا ما قبلتيهاش، ممنوع تستعمل المنصة.' },
  { t: '2. الحساب', d: 'خاصك تكون عندك حساب باش تنشر و تتفاعل. كتكون مسؤول على سرية كلمة المرور ديالك. الحساب شخصي و ما يمكنش تحوّلو.' },
  { t: '3. المحتوى', d: 'كتكون مسؤول على المحتوى اللي كاتنشر. ممنوع: الكراهية، العنف، التحرش، المحتوى غير القانوني، أو انتحال الهوية.' },
  { t: '4. الاحترام', d: 'عاملو المستخدمين الآخرين باحترام. ممنوع السب، التهديد، أو الإزعاج (سبام).' },
  { t: '5. الملكية الفكرية', d: 'المحتوى اللي كاتنشر يبقى ديالك، لكن كتمنحنا رخصة لعرضو فالمنصة. ما يحق لك تنشر محتوى ديال الغير بلا إذن.' },
  { t: '6. إنهاء الحساب', d: 'نقدرو نعلّق أو نحذفو أي حساب يخالف هاد الشروط. حتى نتا تقدر تحذف حسابك من الإعدادات.' },
  { t: '7. المسؤولية', d: 'المنصة مقدمة "كما هي". ما كنضمانوش عدم التوقف أو الأخطاء. المسؤولية ديالنا محدودة فالقانون.' },
  { t: '8. التغييرات', d: 'نقدرو نعدلو هاد الشروط. الاستمرار فاستخدام المنصة يعني القبول بالشروط الجديدة.' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">📜 شروط الاستخدام</h1>
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
