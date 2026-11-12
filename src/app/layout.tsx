import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}