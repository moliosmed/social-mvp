import type { Metadata } from 'next'
import Link from 'next/link'
import NewsletterForm from '@/components/NewsletterForm'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.moliosempire.com/newsletter' },
  title: 'النشرة البريدية | Molios Empire',
  description:
    'تسجل فالنشرة البريدية ديال Molios Empire — نصائح التجارة الإلكترونية، التسويق الرقمي و النمو فالمغرب، كل أسبوع.',
  openGraph: {
    title: 'النشرة البريدية | Molios Empire',
    description: 'نصائح أسبوعية فالتجارة الإلكترونية و التسويق الرقمي فالمغرب.',
  },
}

const WHAT = [
  { icon: '🛒', title: 'التجارة الإلكترونية', text: 'كيفاش تبيع أكثر: دفع، تسليم، زبائن جدد.' },
  { icon: '📈', title: 'التسويق الرقمي', text: 'سوشيال ميديا، ريلز، بريد إلكتروني، سيو.' },
  { icon: '🇲🇦', title: 'السوق المغربي', text: 'أخبار و دراسات حالة من قلب المغرب.' },
  { icon: '🎁', title: 'امتيازات', text: 'عروض و كوبونات للمشتركين قبل أي حد آخر.' },
]

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <span className="inline-block bg-blue-600/20 text-blue-300 px-4 py-1.5 rounded-full text-sm mb-6">
          ✉️ نشرة مجانية
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
          نصائح أسبوعية فـ التجارة الإلكترونية
          <br />
          <span className="text-blue-400">و التسويق الرقمي فالمغرب</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10">
          رسالة وحدة كل نهار جمعة. بلا إزعاج، بلا رسائل تجارية مزيوجة. يمكنك تلغي
          الاشتراك فأي وقت.
        </p>

        <NewsletterForm />

        <div className="grid sm:grid-cols-2 gap-4 mt-16 text-right">
          {WHAT.map((w) => (
            <div key={w.title} className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6">
              <p className="text-2xl mb-2">{w.icon}</p>
              <h2 className="font-bold mb-1">{w.title}</h2>
              <p className="text-sm text-gray-400">{w.text}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-gray-500 text-sm">
          عندك سؤال؟{' '}
          <Link href="/help" className="text-blue-400 hover:text-blue-300">
            مركز المساعدة
          </Link>
        </p>
      </section>
    </div>
  )
}
