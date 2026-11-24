import type { Metadata } from 'next'
import PricingClient from '@/components/PricingClient'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.moliosempire.com/pricing' },
  title: 'الأسعار و الخطط | Molios Empire — مجاني و Premium',
  description:
    'خطط الاشتراك ديال Molios Empire — المجاني و Premium. قارن المميزات و اختر الخطة المناسبة ليك.',
  openGraph: {
    title: 'الأسعار | Molios Empire',
    description: 'قارن بين المجاني و Premium و اختر خطتك.',
    url: 'https://www.moliosempire.com/pricing',
    siteName: 'Molios Empire',
  },
}

export default function PricingPage() {
  return <PricingClient />
}
