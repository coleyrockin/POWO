'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { ACTIVITY_ICONS } from '@/lib/data'
import type { Workout } from '@/lib/types'

interface Props { workouts: Workout[] }

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() + ', 2026'
}

export default function WorkoutLog({ workouts }: Props) {
  return (
    <section>
      <SectionHeader label="All Workouts" meta={`${workouts.length} sessions`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {workouts.map((w, i) => {
          const highlight = w.calories >= 300
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
              style={{
                padding: '18px 16px',
                display: 'flex', flexDirection: 'column', gap: '10px',
                background: highlight ? '#0c1200' : 'var(--color-card)',
                ...(highlight ? { border: '1px solid #2a4400', margin: '-1px' } : {}),
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'var(--color-mid)' }}>{fmtDate(w.date)}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', color: highlight ? 'var(--color-wolf)' : 'var(--color-white)' }}>
                  <span style={{ fontSize: '15px' }}>{ACTIVITY_ICONS[w.activity] ?? '🔥'}</span>
                  {w.activity === 'Unknown Activity' ? 'Activity' : w.activity}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 6px', flexShrink: 0,
                  ...(highlight
                    ? { background: 'var(--color-wolf)', color: 'var(--color-black)' }
                    : { background: '#0f1f00', border: '1px solid #2a4400', color: 'var(--color-wolf)' }),
                }}>
                  {w.calories} kcal
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)' }}>
                  Duration <span style={{ color: 'var(--color-white)' }}>{w.duration_min} min</span>
                </span>
                {w.distance_mi !== null && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)' }}>
                    Distance <span style={{ color: 'var(--color-white)' }}>{w.distance_mi} mi</span>
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
