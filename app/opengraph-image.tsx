import { ImageResponse } from 'next/og'

export const alt = 'POWO — Proof of Workout'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
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
          fontFamily: 'sans-serif',
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
              fontSize: '220px',
              lineHeight: 0.9,
              letterSpacing: '-0.04em',
              color: '#f0ede6',
              display: 'flex',
            }}
          >
            POWO
          </div>
          <div style={{ fontSize: '36px', color: '#c0c0c0', display: 'flex' }}>
            Proof of Workout — a week, in data.
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
            <span style={{ color: '#248bf5' }}>54,071</span>
            <span>steps</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#34c759' }}>19</span>
            <span>workouts</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#ffaa22' }}>38.3</span>
            <span>VO₂ max</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span style={{ color: '#ff6b6b' }}>140</span>
            <span>pushups</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
