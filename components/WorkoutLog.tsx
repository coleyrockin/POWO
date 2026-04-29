'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { ACTIVITY_SVG_ICONS } from '@/lib/icons'
import type { Workout, WorkoutTypeSummary } from '@/lib/types'

interface Props {
  workouts: Workout[]
  workoutSummary: WorkoutTypeSummary[]
}

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

function fmtTime(iso: string) {
  // Stored as UTC; render in local time.
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function timeOfDayLabel(hour: number): string {
  if (hour < 6)  return 'EARLY'
  if (hour < 12) return 'MORNING'
  if (hour < 17) return 'AFTERNOON'
  if (hour < 21) return 'EVENING'
  return 'LATE'
}

const ACTIVITY_COLORS: Record<string, string> = {
  'Walking': 'var(--accent-blue)',
  'Weight Training': 'var(--accent-coral)',
  'Pickleball': 'var(--accent-amber)',
  'Paddling': 'var(--accent-teal)',
  'Golf': 'var(--accent-green)',
  'Hiking': 'var(--accent-teal)',
  'Skating': 'var(--accent-purple)',
  'Yoga': 'var(--color-mid)',
  'Running': 'var(--accent-coral)',
  'Stair Climbing': 'var(--color-mid)',
  'Core Training': 'var(--color-mid)',
}

export default function WorkoutLog({ workouts, workoutSummary }: Props) {
  const totalSessions = workoutSummary.reduce((a, w) => a + w.sessions, 0)
  const totalCal = workoutSummary.reduce((a, w) => a + w.total_calories, 0)
  const top = [...workouts].sort((a, b) => b.calories - a.calories).slice(0, 6)
  const maxSummaryCal = Math.max(...workoutSummary.map(w => w.total_calories))

  return (
    <section id="workouts">
      <SectionHeader label="Workout Library" meta={`${totalSessions} sessions · ${Math.round(totalCal).toLocaleString()} kcal`} />

      {/* Activity breakdown */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '12px' }}>By Activity Type</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {workoutSummary.map((w, i) => {
            const Icon = ACTIVITY_SVG_ICONS[w.type] ?? ACTIVITY_SVG_ICONS['Unknown Activity']
            const color = ACTIVITY_COLORS[w.type] ?? 'var(--color-white)'
            const pct = Math.round((w.total_calories / maxSummaryCal) * 100)
            const hours = Math.round(w.total_duration_min / 60)
            return (
              <motion.div key={w.type}
                initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                style={{ display: 'grid', gridTemplateColumns: '20px 1fr auto', alignItems: 'center', gap: '10px' }}
              >
                <span style={{ color, lineHeight: 0 }}><Icon size={16} /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500, color: 'var(--color-white)' }}>{w.type === 'Weight Training' ? 'Weights' : w.type}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)' }}>
                      <span style={{ color }}>{w.sessions}</span> sessions · {hours}h
                    </span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '3px', background: 'linear-gradient(180deg, #2e2e2e, #3e3e3e)', overflow: 'hidden', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.4)' }}>
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.7, ease: [0.16, 1, 0.3, 1] }} style={{ height: '5px', borderRadius: '3px', background: `linear-gradient(180deg, color-mix(in srgb, ${color} 100%, white 18%), ${color})`, boxShadow: `0 0 8px color-mix(in srgb, ${color} 60%, transparent)` }} />
                  </div>
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color, letterSpacing: '0.5px', minWidth: '52px', textAlign: 'right' }}>{Math.round(w.total_calories).toLocaleString()}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Top single sessions */}
      <SectionHeader label="Top Sessions" meta="all 91 days" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignItems: 'stretch', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {top.map((w, i) => {
          const highlight = w.calories >= 500
          const isBest = i === 0
          const intensity = w.duration_min > 0 ? (w.calories / w.duration_min) : 0
          const distMi = w.distance_m ? (w.distance_m / 1609.34).toFixed(2) : null
          const Icon = ACTIVITY_SVG_ICONS[w.type] ?? ACTIVITY_SVG_ICONS['Unknown Activity']
          const color = ACTIVITY_COLORS[w.type] ?? 'var(--color-white)'
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: (i % 6) * 0.04 }}
              className="powo-lift"
              style={{
                padding: '16px 14px',
                minHeight: '158px',
                height: '100%',
                display: 'flex', flexDirection: 'column', gap: '8px',
                background: highlight ? `linear-gradient(180deg, color-mix(in srgb, ${color} 14%, #0a0a0a), color-mix(in srgb, ${color} 6%, #0a0a0a))` : 'var(--color-card)',
                position: 'relative',
                ...(highlight ? { border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`, margin: '-1px', boxShadow: `inset 0 1px 0 color-mix(in srgb, ${color} 22%, transparent), 0 0 24px color-mix(in srgb, ${color} 10%, transparent)` } : {}),
              }}
            >
              {isBest && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-black)', background: 'var(--accent-amber)', padding: '2px 6px', borderRadius: '2px', fontWeight: 700 }}>BEST</div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--color-mid)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px' }}>
                <span>{fmtDate(w.date)}</span>
                <span style={{ fontSize: '10px' }}>
                  <span style={{ color: 'var(--color-mid)', letterSpacing: '0.06em' }}>{timeOfDayLabel(new Date(w.start).getHours())}</span>
                  <span style={{ color: 'var(--color-dim)' }}> · </span>
                  <span>{fmtTime(w.start)}</span>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px', color: highlight ? color : 'var(--color-white)' }}>
                  <Icon size={16} />
                  {w.type === 'Weight Training' ? 'Weights' : w.type}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, padding: '3px 8px', flexShrink: 0,
                  ...(highlight ? { background: color, color: 'var(--color-black)' } : { background: '#0a0a0a', border: '1px solid var(--color-border)', color: 'var(--color-white)' }) }}>
                  {Math.round(w.calories)} kcal
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)' }}>
                  <span style={{ color: 'var(--color-white)' }}>{Math.round(w.duration_min)}</span> min
                </span>
                {distMi !== null && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)' }}>
                    <span style={{ color: 'var(--color-white)' }}>{distMi}</span> mi
                  </span>
                )}
                {intensity > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)', marginLeft: 'auto' }}>
                    <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{intensity.toFixed(1)}</span>
                    <span style={{ fontSize: '10px' }}> kcal/min</span>
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
