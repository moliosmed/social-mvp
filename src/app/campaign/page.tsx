import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.moliosempire.com/campaign' },
  title: 'الحملة المجانية | Molios Empire',
  description: 'حملة نمو مجانية 100% — دعوة الأصدقاء، تحدي المحتوى، ومجتمع التجار. بلا إعلانات مدفوعة.',
}

const STEPS = [
  { icon: '🎁', t: '1. دع أصدقاءك', d: 'كل 3 دعوات = 7 أيام Premium مجاناً. شارك رابطك الشخصي.' },
  { icon: '✍️', t: '2. انشر يومياً', d: 'منشور واحد كل يوم. شارك تجربتك، نصائحك، أو منتجك.' },
  { icon: '🎬', t: '3. فيديو قصير', d: 'ريل/تيك توك قصير (15-30 ثانية) — أقصى وصول.' },
  { icon: '🤝', t: '4. تفاعل', d: 'رد على 20 منشور فاليوم. الـ engagement هو العملة.' },
]

const REWARDS = [
  { n: '1', label: 'منشور', reward: 'ظهور أكبر' },
  { n: '3', label: 'دعوات', reward: '7 أيام Premium' },
  { n: '7', label: 'أيام متتالية', reward: 'شارة "النشيط"' },
  { n: '30', label: 'منشور', reward: 'شارة "المبدع"' },
]

export default function CampaignPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-green-600/20 text-green-300 text-sm px-4 py-1.5 rounded-full mb-6">
          🌱 مجاني 100% — بلا إعلانات
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          كبر معانا
          <span className="text-green-400"> بلا فلوس</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          حملة نمو عضوية: الدعوات + المحتوى + المجتمع. كل ما تنشر و تتفاعل،
          كل ما تكبر — و تربح Premium مجاناً.
        </p>
        <Link href="/" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-10 py-4 rounded-full text-lg transition">
          ابدأ الحملة 🚀
        </Link>
      </header>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold mb-8 text-center">4 خطوات</h2>
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          {STEPS.map((s) => (
            <div key={s.t} className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700">
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="text-xl font-bold mb-3">{s.t}</h3>
              <p className="text-gray-300">{s.d}</p>
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold mb-8 text-center">المكافآت</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {REWARDS.map((r) => (
            <div key={r.n} className="bg-green-600/10 rounded-2xl p-6 border border-green-500/30 text-center">
              <div className="text-3xl font-extrabold text-green-400 mb-1">{r.n}</div>
              <div className="text-sm text-gray-400 mb-2">{r.label}</div>
              <div className="text-sm font-bold">{r.reward}</div>
            </div>
          ))}
        </div>

        <div className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700 mb-16">
          <h2 className="text-2xl font-bold mb-4">🎯 القواعد</h2>
          <ul className="space-y-3 text-gray-300">
            <li>✅ منشور واحد كل يوم (نص، صورة، أو فيديو)</li>
            <li>✅ تفاعل مع 20 منشور فاليوم</li>
            <li>✅ لا سبام، لا كراهية، لا محتوى مزيف</li>
            <li>✅ شارك رابط الدعوة ديالك</li>
          </ul>
        </div>

        <div className="text-center bg-green-600/20 rounded-2xl p-10 border border-green-500/30">
          <h2 className="text-2xl font-bold mb-4">جاهز؟</h2>
          <Link href="/" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-full transition">
            سجل و ابدأ 🌱
          </Link>
        </div>
      </section>
    </div>
  )
}
