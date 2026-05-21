import type { MetadataRoute } from 'next'
import { SITE_MARKETING_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: SITE_NAME,
    description: SITE_MARKETING_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    orientation: 'portrait',
    categories: ['health', 'fitness', 'lifestyle'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
