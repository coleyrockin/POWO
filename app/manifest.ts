import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'POWO — Proof of Workout',
    short_name: 'POWO',
    description:
      'A mobile-first fitness dashboard that turns 91 days of Apple Health data into a cinematic, editorial-grade interface.',
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
