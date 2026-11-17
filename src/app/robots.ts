import type { MetadataRoute } from 'next'

const BASE = 'https://www.moliosempire.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/messages', '/profile', '/groups', '/api/'],
    },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
