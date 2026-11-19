import type { MetadataRoute } from 'next'

const BASE = 'https://www.moliosempire.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/landing`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/pricing`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/groups`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/help`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.4 },
  ]
}
