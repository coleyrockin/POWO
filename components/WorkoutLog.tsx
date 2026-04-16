'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { ACTIVITY_SVG_ICONS } from '@/lib/icons'
import type { Workout } from '@/lib/types'

interface Props { workouts: Workout[] }

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase() + ', 2026'
}

export default function WorkoutLog({ workouts }: Props) {
  const top = [...workouts].sort((a, b) => b.calories - a.calories).slice(0, 6)
  return (
    <section>
      <SectionHeader label="Top Workouts" meta={`${workouts.length} total`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {top.map((w, i) => {
          const highlight = w.calories >= 300
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
              style={{
                padding: '14px 12px',
                display: 'flex', flexDirection: 'column', gap: '8px',
                background: highlight ? '#0c1200' : 'var(--color-card)',
                ...(highlight ? { border: '1px solid #2a4400', margin: '-1px' } : {}),
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', color: 'var(--color-mid)' }}>{fmtDate(w.date)}</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px', color: highlight ? 'var(--color-wolf)' : 'var(--color-white)' }}>
                  {(() => { const Icon = ACTIVITY_SVG_ICONS[w.activity] ?? ACTIVITY_SVG_ICONS['Unknown Activity']; return <Icon size={16} />; })()}
                  {w.activity === 'Weight Training' ? 'Weights' : w.activity === 'Unknown Activity' ? 'Activity' : w.activity}
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
