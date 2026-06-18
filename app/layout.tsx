import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, DM_Mono, DM_Sans, Newsreader } from 'next/font/google'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import MotionRoot from '@/components/MotionRoot'
import ThemeToggle from '@/components/ThemeToggle'
import {
  SITE_AUTHOR,
  SITE_DESCRIPTION,
  SITE_MARKETING_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from '@/lib/site'
import './globals.css'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_TITLE,
  url: SITE_URL,
  description: SITE_MARKETING_DESCRIPTION,
  author: {
    '@type': 'Person',
    name: SITE_AUTHOR,
  },
}

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

// Editorial voice — literary screen serif for narrative beats (headline, coach,
// insights). Contrasts the mono "instrument panel" labels.
const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})

const shouldLoadVercelTelemetry = process.env.VERCEL === '1'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  manifest: '/manifest.webmanifest',
  keywords: ['Apple Health', 'fitness dashboard', 'Next.js', 'data visualization', 'HealthKit', 'VO2 max', 'recovery'],
  authors: [{ name: SITE_AUTHOR }],
  creator: SITE_AUTHOR,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_TITLE,
    description: 'Apple Health, distilled into Proof of Workout.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: 'Apple Health, distilled into Proof of Workout.',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#080808' },
    { media: '(prefers-color-scheme: light)', color: '#f4f3ec' },
  ],
  colorScheme: 'dark light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${bebasNeue.variable} ${dmMono.variable} ${dmSans.variable} ${newsreader.variable}`}>
      <body>
        <Script id="powo-theme" strategy="beforeInteractive">
          {`(function(){try{var t=localStorage.getItem('powo-theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`}
        </Script>
        <Script id="powo-jsonld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
        <MotionRoot>{children}</MotionRoot>
        <ThemeToggle />
        {shouldLoadVercelTelemetry ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  )
}
