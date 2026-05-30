import { ImageResponse } from 'next/og'
import type { ReactElement } from 'react'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { healthData } from '@/lib/data'
import { buildWeekChange } from '@/lib/helpers'
import {
  CARD_SIZE,
  STORY_SIZE,
  renderOverviewCard,
  renderWeekCard,
  renderActivityCard,
  renderStoryCard,
} from '@/lib/card-data'

// Data is a compile-time constant, so the cards are baked at build time.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return [{ variant: 'overview' }, { variant: 'week' }, { variant: 'activity' }, { variant: 'story' }]
}

export async function GET(_req: Request, { params }: { params: Promise<{ variant: string }> }) {
  const { variant } = await params

  let element: ReactElement
  let size = CARD_SIZE
  if (variant === 'overview') element = renderOverviewCard(healthData)
  else if (variant === 'week') element = renderWeekCard(healthData, buildWeekChange(healthData.daily))
  else if (variant === 'activity') element = renderActivityCard(healthData)
  else if (variant === 'story') { element = renderStoryCard(healthData); size = STORY_SIZE }
  else return new Response('Not found', { status: 404 })

  const [bebas, dmSans] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/BebasNeue-Regular.ttf')),
    readFile(join(process.cwd(), 'public/fonts/DMSans-Regular.ttf')),
  ])

  return new ImageResponse(element, {
    ...size,
    fonts: [
      { name: 'Bebas Neue', data: bebas, weight: 400, style: 'normal' },
      { name: 'DM Sans', data: dmSans, weight: 400, style: 'normal' },
    ],
    headers: {
      'Content-Disposition': `attachment; filename="powo-${variant}.png"`,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
