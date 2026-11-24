import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.moliosempire.com/about' },
  title: 'من نحن | Molios Empire — الشبكة الاجتماعية العربية المغربية',
  description: 'Molios Empire — شبكة اجتماعية عربية مغربية. تعرّف على قصتنا، رؤيتنا، وفريقنا.',
  openGraph: { title: 'من نحن | Molios Empire', description: 'Molios Empire — شبكة اجتماعية عربية.' },
}

const VALUES = [
  { icon: '🌍', t: 'عربي أولاً', d: 'منصة بالدار العربية و لهجات شمال إفريقيا.' },
  { icon: '⚡', t: 'سريع', d: 'تفاعل فوري بلا تحديث.' },
  { icon: '🔒', t: 'آمن', d: 'بياناتك محمية و محفوظة.' },
  { icon: '💡', t: 'مفيد', d: 'محتوى يخدم التجار و المبدعين.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-blue-600/20 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
          👋 قصتنا
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          من فكرة بسيطة إلى
          <span className="text-blue-500"> إمبراطورية</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          Molios Empire وُلدت من سؤال بسيط: علاش ما كاينة شبكة اجتماعية عربية
          مصممة خصيصاً للمغرب و شمال إفريقيا؟ دابا كاينة.
        </p>
      </header>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-3">🎯 رسالتنا</h2>
            <p className="text-gray-300 leading-relaxed">
              نبني مساحة رقمية آمنة و مفيدة تجمع المبدعين، التجار، و المهتمين —
              باش يتبادلو الأفكار، يتعاونو، و يكبرو معاً.
            </p>
          </div>
          <div className="bg-gray-800/60 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold mb-3">🚀 رؤيتنا</h2>
            <p className="text-gray-300 leading-relaxed">
              نكون الشبكة الاجتماعية العربية الأولى — منصة عالمية بجذور مغربية،
              تخدم ملايين المستخدمين حول العالم.
            </p>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-8 text-center">قيّمنا</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {VALUES.map((v) => (
            <div key={v.t} className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700 text-center">
              <div className="text-3xl mb-3">{v.icon}</div>
              <h3 className="font-bold mb-2">{v.t}</h3>
              <p className="text-sm text-gray-400">{v.d}</p>
            </div>
          ))}
        </div>

        <div className="text-center bg-blue-600/20 rounded-2xl p-10 border border-blue-500/30">
          <h2 className="text-2xl font-bold mb-4">انضم إلينا اليوم</h2>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-full transition"
          >
            سجل مجاناً 🚀
          </Link>
        </div>
      </section>
    </div>
  )
}
