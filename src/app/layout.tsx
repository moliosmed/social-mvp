import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: 'Molio Empire | شبكتك الاجتماعية',
  description: 'شارك أفكارك، صورك، وتواصل مع أصدقائك على Molio Empire. منصة اجتماعية عصرية وسريعة.',
  openGraph: {
    title: 'Molio Empire',
    description: 'شارك أفكارك، صورك، وتواصل مع أصدقائك على Molio Empire.',
    url: 'https://www.moliosempire.com',
    siteName: 'Molio Empire',
    images: [
      {
        url: 'https://www.moliosempire.com/og-image.png', // غادي نصايبو هاد الصورة دابا
        width: 1200,
        height: 630,
        alt: 'Molio Empire Preview',
      },
    ],
    locale: 'ar_MA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Molio Empire',
    description: 'شارك أفكارك، صورك، وتواصل مع أصدقائك على Molio Empire.',
    images: ['https://www.moliosempire.com/og-image.png'],
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
