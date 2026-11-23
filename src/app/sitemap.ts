import type { MetadataRoute } from 'next'

const BASE = 'https://www.moliosempire.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/landing`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/pricing`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/help`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/campaign`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/blog/morocco-social-media`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/online-money-ma`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/ecommerce-payments`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/ecommerce-morocco`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/social-media-tips`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/moliosempire-features`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/dropshipping-guide`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/content-marketing`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/grow-store`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/product-selection`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/personal-brand`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog/social-income`, changeFrequency: 'monthly', priority: 0.7 },
  ]
}
