import type { MetadataRoute } from 'next'
import { SITE_LAST_MODIFIED, SITE_URL } from '@/lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(SITE_LAST_MODIFIED),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ]
}
