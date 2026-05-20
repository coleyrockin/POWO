import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, DM_Mono, DM_Sans } from 'next/font/google'
import MotionRoot from '@/components/MotionRoot'
import './globals.css'

const SITE_URL = 'https://proof-of-workout-next.vercel.app'

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas-neue',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-dm-mono',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'POWO — Proof of Workout',
  description:
    'Proof of Workout turns Apple Health into a mobile-first dashboard with VO2 trajectory, sleep stages, cardiac trends, workout volume, and training recommendations.',
  keywords: ['Apple Health', 'fitness dashboard', 'Next.js', 'data visualization', 'HealthKit', 'VO2 max', 'recovery'],
  authors: [{ name: 'Coley Roberts' }],
  creator: 'Coley Roberts',
  openGraph: {
    title: 'POWO — Proof of Workout',
    description: 'Apple Health, distilled into Proof of Workout.',
    url: SITE_URL,
    siteName: 'POWO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'POWO — Proof of Workout',
    description: 'Apple Health, distilled into Proof of Workout.',
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
    <html lang="en" className={`${bebasNeue.variable} ${dmMono.variable} ${dmSans.variable}`}>
      <body>
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  )
}
