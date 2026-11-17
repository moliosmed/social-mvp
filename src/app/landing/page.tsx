import Link from 'next/link'

const PLANS = [
  {
    name: 'المجانية',
    price: '$0',
    period: '/شهرياً',
    features: ['وصول لـ 3 غرف نقاش', 'مشاهدة المنشورات العامة', 'المشاركة فالنقاشات', 'دعم المجتمع'],
    cta: 'ابدأ مجاناً',
    highlight: false,
  },
  {
    name: 'الأساسية',
    price: '$15',
    period: '/شهرياً',
    features: ['وصول كامل لكل الغرف', 'تحميل جميع القوالب', 'حضور الجلسات المباشرة', 'قائمة الموردين الموثوقين', 'سوق الخدمات الداخلي'],
    cta: 'اشترك الآن',
    highlight: true,
  },
  {
    name: 'البريميوم',
    price: '$30',
    period: '/شهرياً',
    features: ['كل مزايا الأساسية', 'جلسة استشارية شهرية', 'شارة VIP مميزة', 'أولوية فالدعم', 'وصول مبكر للميزات'],
    cta: 'اشترك الآن',
    highlight: false,
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero */}
      <header className="max-w-5xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-blue-600/20 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
          🚀 مجتمع التجارة الإلكترونية الأول فالمغرب
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
          حوّل متجرك من فكرة<br />
          <span className="text-blue-500">إلى إمبراطورية تجارية</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          انضم لأكبر مجتمع عربي للتجارة الإلكترونية — يتشارك أصحاب المتاجر الأسرار،
          الموردين الموثوقين، والاستراتيجيات المجربة.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-14">
          <div><p className="text-3xl font-bold">+500</p><p className="text-sm text-gray-400">تاجر نشط</p></div>
          <div><p className="text-3xl font-bold">+50</p><p className="text-sm text-gray-400">مورد موثوق</p></div>
          <div><p className="text-3xl font-bold">24/7</p><p className="text-sm text-gray-400">دعم متواصل</p></div>
        </div>
      </header>

      {/* المميزات */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '💡', t: 'أسرار مجربة', d: 'استراتيجيات الربح من تجار فايتين فين كنت' },
            { icon: '🤝', t: 'موردين موثوقين', d: 'قائمة موردين موثوقين باش تبدى بسرعة' },
            { icon: '🎓', t: 'جلسات مباشرة', d: 'ورشات و جلسات أسئلة كل أسبوع' },
            { icon: '📦', t: 'قوالب جاهزة', d: 'قوالب متاجر، إعلانات، و إيميلات' },
            { icon: '🛒', t: 'سوق الخدمات', d: 'خدم مع تجار آخرين و وفر الوقت' },
            { icon: '📈', t: 'إحصائيات', d: 'تابع أداء متجرك و  learn من الآخرين' },
          ].map(f => (
            <div key={f.t} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.t}</h3>
              <p className="text-sm text-gray-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* الأسعار */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10">اختر خطتك المناسبة</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map(p => (
            <div
              key={p.name}
              className={`rounded-2xl p-6 border ${p.highlight ? 'bg-blue-600 border-blue-500 scale-105' : 'bg-gray-800 border-gray-700'}`}
            >
              {p.highlight && <div className="text-xs font-bold bg-yellow-400 text-gray-900 inline-block px-3 py-1 rounded-full mb-4">موصى به</div>}
              <h3 className="text-lg font-bold">{p.name}</h3>
              <p className="text-4xl font-extrabold my-4">{p.price}<span className="text-base font-normal opacity-70">{p.period}</span></p>
              <ul className="space-y-2 mb-6 text-sm">
                {p.features.map(f => <li key={f} className="flex items-center gap-2"><span className="text-blue-400">✓</span>{f}</li>)}
              </ul>
              <Link
                href="/pricing"
                className={`block text-center py-2.5 rounded-lg font-semibold transition ${p.highlight ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-20 px-6">
        <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك نحو النجاح اليوم</h2>
        <p className="text-gray-300 mb-8">انضم لأكثر من 500 تاجر كايـنمّو أعمالهم يومياً</p>
        <Link href="/" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
          انضم الآن مجاناً
        </Link>
        <p className="mt-10 text-sm text-gray-500">Molios Empire — حيث يلتقي التجار و تنمو المتاجر</p>
      </section>
    </div>
  )
}
