import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Link from 'next/link'
import Pwa from '@/components/Pwa'
import './globals.css'
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})
export const metadata: Metadata = {
  metadataBase: new URL('https://www.moliosempire.com'),
  alternates: { canonical: 'https://www.moliosempire.com/' },
  title: 'Molios Empire | شبكتك الاجتماعية',
  description: 'شارك أفكارك، صورك، وتواصل مع أصدقائك على Molios Empire. منصة اجتماعية عصرية وسريعة.',
  keywords: ['social network', 'شبكة اجتماعية', 'molios empire', 'منصة اجتماعية', 'مشاركة صور'],
  authors: [{ name: 'Molios Empire' }],
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Molios Empire',
    description: 'شارك أفكارك، صورك، وتواصل مع أصدقائك على Molios Empire.',
    url: 'https://www.moliosempire.com',
    siteName: 'Molios Empire',
    images: [
      {
        url: 'https://www.moliosempire.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Molios Empire - شبكتك الاجتماعية',
      },
    ],
    locale: 'ar_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Molios Empire',
    description: 'شارك أفكارك، صورك، وتواصل مع أصدقائك على Molios Empire.',
    images: ['https://www.moliosempire.com/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/site.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Molios Empire',
  },
  formatDetection: { telephone: false },
  verification: {
    google: 'q1F5eEvyq2I6IQhkUPdhDu6O8pfT5RPQcnv411WRIsE',
  },
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Molios Empire',
              alternateName: 'موليوس إمباير',
              url: 'https://www.moliosempire.com',
              inLanguage: ['ar', 'en'],
              publisher: {
                '@type': 'Organization',
                name: 'Molios Empire',
                url: 'https://www.moliosempire.com',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://www.moliosempire.com/og-image.png',
                },
              },
            }),
          }}
        />
        {children}
        <Pwa />
        <footer className="bg-gray-900 text-gray-400 border-t border-gray-800">
          <div className="max-w-5xl mx-auto px-6 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <p className="text-white font-bold mb-3">🌍 Molios Empire</p>
              <p>شبكتك العربية المغربية — منشورات، تفاعلات، رسائل فورية، مجموعات.</p>
            </div>
            <div>
              <p className="text-white font-bold mb-3">الصفحات</p>
              <ul className="space-y-2">
                <li><Link href="/landing" className="hover:text-white">الرئيسية (B2B)</Link></li>
                <li><Link href="/pricing" className="hover:text-white">الأسعار</Link></li>
                <li><Link href="/groups" className="hover:text-white">المجموعات</Link></li>
                <li><Link href="/about" className="hover:text-white">من نحن</Link></li>
                <li><Link href="/blog" className="hover:text-white">المدونة</Link></li>
                <li><Link href="/newsletter" className="hover:text-white">النشرة البريدية</Link></li>
                <li><Link href="/campaign" className="hover:text-white">الحملة المجانية</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3">المساعدة</p>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:text-white">مركز المساعدة</Link></li>
                <li><Link href="/privacy" className="hover:text-white">الخصوصية</Link></li>
                <li><Link href="/terms" className="hover:text-white">شروط الاستخدام</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-white font-bold mb-3">تواصل</p>
              <ul className="space-y-2">
                <li><a href="mailto:mohamedbennah1@gmail.com" className="hover:text-white">البريد</a></li>
                <li><a href="https://www.instagram.com/moliosempire0/" className="hover:text-white">Instagram</a></li>
                <li><a href="https://www.facebook.com/MOLIOSEMPIRO" className="hover:text-white">Facebook</a></li>
                <li><a href="https://www.tiktok.com/@MOLIOSEMPIRE" className="hover:text-white">TikTok</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 py-4 text-center text-xs">
            © 2026 Molios Empire — كل الحقوق محفوظة
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
