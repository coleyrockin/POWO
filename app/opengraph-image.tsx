import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { healthData } from '@/lib/data'

export const alt = 'POWO — Proof of Workout'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const pushups = healthData.pushups.weeks.reduce((total, week) => total + week.total, 0)
  const [bebas, dmSans] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/BebasNeue-Regular.ttf')),
    readFile(join(process.cwd(), 'public/fonts/DMSans-Regular.ttf')),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#080808',
          color: '#f0ede6',
          padding: '80px',
          fontFamily: 'DM Sans',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#248bf5',
              boxShadow: '0 0 24px #248bf5',
            }}
          />
          <div
            style={{
              fontSize: '24px',
              letterSpacing: '0.3em',
              color: '#c0c0c0',
              textTransform: 'uppercase',
            }}
          >
            Apple Health · Verified
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontFamily: 'Bebas Neue',
              fontSize: '240px',
              lineHeight: 0.9,
              letterSpacing: '0.01em',
              color: '#f0ede6',
              display: 'flex',
            }}
          >
            POWO
          </div>
          <div style={{ fontSize: '36px', color: '#c0c0c0', display: 'flex' }}>
            Proof of Workout — Apple Health, in data.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '48px',
            fontSize: '22px',
            color: '#c0c0c0',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#248bf5' }}>{healthData.summary.period_totals.total_steps.toLocaleString()}</span>
            <span>steps</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#34c759' }}>{healthData.summary.period_totals.total_workouts}</span>
            <span>workouts</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#ffaa22' }}>{healthData.summary.vo2_max_progression.peak.value.toFixed(1)}</span>
            <span>VO₂ max</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#ff6b6b' }}>{pushups}</span>
            <span>pushups</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bebas Neue', data: bebas, weight: 400, style: 'normal' },
        { name: 'DM Sans', data: dmSans, weight: 400, style: 'normal' },
      ],
    },
  )
}
