import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'المدونة | Molios Empire',
  description: 'مقالات ونصائح حول التجارة الإلكترونية، التسويق الرقمي، والشبكات الاجتماعية.',
}

const POSTS = [
  { slug: 'ecommerce-morocco', title: 'كيفاش تبدا التجارة الإلكترونية فالمغرب 2026', date: '2026-11-19', read: '5 دقائق', cat: 'تجارة', excerpt: 'دليل كامل خطوة بخطوة باش تبدا متجرك الإلكتروني فالمغرب.' },
  { slug: 'social-media-tips', title: '5 نصائح باش تربح من السوشيال ميديا', date: '2026-11-19', read: '4 دقائق', cat: 'تسويق', excerpt: 'استراتيجيات مجربة باش تكبر متابعيك و تربح من المحتوى.' },
  { slug: 'moliosempire-features', title: ' Molios Empire: الشبكة الاجتماعية المغربية الأولى', date: '2026-11-19', read: '3 دقائق', cat: 'منصة', excerpt: 'كل اللي خاصك تعرف على Molios Empire — المميزات، الدخل، و كيفاش تنضم.' },
  { slug: 'dropshipping-guide', title: 'الدروب شيبينغ للمبتدئين', date: '2026-11-19', read: '6 دقائق', cat: 'تجارة', excerpt: 'كيفاش تبدا الدروب شيبينغ بلا رأسمال كبير و تبيع فالمغرب.' },
  { slug: 'content-marketing', title: 'تسويق المحتوى: كيفاش تكتب منشورات كتجيب المبيعات', date: '2026-11-19', read: '5 دقائق', cat: 'تسويق', excerpt: 'فن كتابة المحتوى اللي كيرشد الزائر للشراء.' },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-block bg-blue-600/20 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">📝 المدونة</div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">مقالات ونصائح</h1>
        <p className="text-gray-300">محتوى يخدم التجار و المبدعين.</p>
      </header>

      <section className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="block bg-gray-800/60 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition">
            <div className="flex items-center gap-3 mb-3 text-xs">
              <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full">{p.cat}</span>
              <span className="text-gray-500">{p.date}</span>
              <span className="text-gray-500">· {p.read}</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{p.title}</h2>
            <p className="text-gray-300">{p.excerpt}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
