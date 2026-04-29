'use client'
import { motion } from 'framer-motion'
import { ACTIVITY_SVG_ICONS } from '@/lib/icons'
import type { DailyMetric, Workout } from '@/lib/types'
import SectionHeader from './SectionHeader'

interface Props {
  daily: DailyMetric[]
  workouts: Workout[]
}

export default function ActivityRings({ daily, workouts }: Props) {
  const last14 = daily.slice(-14)
  const maxCal = Math.max(...last14.map(d => d.active_kcal ?? 0))

  // Group workouts by date
  const workoutsByDate: Record<string, string[]> = {}
  for (const w of workouts) {
    if (!workoutsByDate[w.date]) workoutsByDate[w.date] = []
    if (!workoutsByDate[w.date].includes(w.type)) {
      workoutsByDate[w.date].push(w.type)
    }
  }

  const totalCal = last14.reduce((a, d) => a + (d.active_kcal ?? 0), 0)

  return (
    <section>
      <SectionHeader label="14-Day Burn" meta={`${Math.round(totalCal).toLocaleString()} kcal`} />
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '20px 14px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(14, 1fr)', gap: '3px', alignItems: 'flex-end' }}>
          {last14.map((d, i) => {
            const cal = d.active_kcal ?? 0
            const pct = maxCal > 0 ? cal / maxCal : 0
            const isPeak = cal === maxCal && cal > 0
            const dayWorkouts = workoutsByDate[d.date] ?? []
            const barHeight = Math.max(Math.round(pct * 96), 4)
            const dow = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })[0]

            return (
              <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                {isPeak && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, duration: 0.3 }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.12em', color: 'var(--color-black)', background: 'var(--accent-amber)', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}
                  >★</motion.div>
                )}
                {!isPeak && <div style={{ height: '12px' }} />}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '14px', justifyContent: 'flex-end' }}>
                  {dayWorkouts.length > 0 && (() => {
                    const Icon = ACTIVITY_SVG_ICONS[dayWorkouts[0]] ?? ACTIVITY_SVG_ICONS['Unknown Activity']
                    return <Icon size={10} color={isPeak ? 'var(--accent-amber)' : 'var(--color-mid)'} />
                  })()}
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: isPeak ? '11px' : '10px', color: isPeak ? 'var(--accent-amber)' : 'var(--color-white)', textAlign: 'center', lineHeight: 1, letterSpacing: '0.5px' }}>
                  {cal >= 1000 ? (cal / 1000).toFixed(1) + 'k' : Math.round(cal)}
                </div>

                <div style={{ width: '100%', height: '96px', display: 'flex', alignItems: 'flex-end' }}>
                  <motion.div
                    initial={{ height: 0 }} whileInView={{ height: barHeight }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: '100%', borderRadius: '3px 3px 0 0',
                      background: isPeak
                        ? 'linear-gradient(180deg, #ffc857 0%, var(--accent-amber) 60%, #d98e0a 100%)'
                        : `linear-gradient(180deg, rgba(80, 173, 255, ${0.45 + pct * 0.55}), rgba(10, 132, 255, ${0.35 + pct * 0.65}))`,
                      boxShadow: isPeak
                        ? '0 0 18px rgba(255, 170, 34, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        : `0 0 10px rgba(10, 132, 255, ${0.18 + pct * 0.28}), inset 0 1px 0 rgba(255, 255, 255, 0.14)`,
                    }}
                  />
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.05em', color: isPeak ? 'var(--accent-amber)' : 'var(--color-mid)', textAlign: 'center', fontWeight: isPeak ? 600 : 400 }}>
                  {dow}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
