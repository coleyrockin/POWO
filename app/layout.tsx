import type { Metadata, Viewport } from 'next'
import './globals.css'

const SITE_URL = 'https://proof-of-workout-next.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'POWO — Proof of Workout',
  description:
    'Proof of Workout — 91 days of Apple Health turned into a mobile-first dashboard. VO₂ trajectory, sleep stages, cardiac trends, 160 workouts, and AI-generated rest + training recommendations.',
  keywords: ['Apple Health', 'fitness dashboard', 'Next.js', 'data visualization', 'HealthKit', 'VO2 max', 'recovery'],
  authors: [{ name: 'Coley Roberts' }],
  creator: 'Coley Roberts',
  openGraph: {
    title: 'POWO — Proof of Workout',
    description: '91 days of Apple Health, distilled.',
    url: SITE_URL,
    siteName: 'POWO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POWO — Proof of Workout',
    description: '91 days of Apple Health, distilled.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#080808',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
