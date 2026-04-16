import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PROOF OF WORKOUT — COLEY',
  description: 'Apple Health verified weekly fitness data for Coley. Week of Apr 8–14, 2026.',
  openGraph: {
    title: 'PROOF OF WORKOUT — COLEY',
    description: 'Apple Health verified. Week of Apr 8–14, 2026.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
