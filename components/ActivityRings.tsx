'use client'
import { motion } from 'framer-motion'
import { ACTIVITY_SVG_ICONS } from '@/lib/icons'
import type { WeeklySummary, DailyMetric, Workout } from '@/lib/types'

interface Props {
  summary: WeeklySummary
  daily: DailyMetric[]
  workouts: Workout[]
}

const DAY_LABELS = ['TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN', 'MON']

export default function ActivityRings({ daily, workouts }: Props) {
  const maxCal = Math.max(...daily.map(d => d.active_calories))

  // Group workouts by date
  const workoutsByDate: Record<string, string[]> = {}
  for (const w of workouts) {
    if (!workoutsByDate[w.date]) workoutsByDate[w.date] = []
    if (!workoutsByDate[w.date].includes(w.activity)) {
      workoutsByDate[w.date].push(w.activity)
    }
  }

  return (
    <section>
      <div
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          padding: '20px 16px 18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--color-white)',
            }}
          >
            Week Burn
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '9px',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--color-mid)',
            }}
          >
            Active kcal · by day
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            alignItems: 'flex-end',
          }}
        >
          {daily.map((d, i) => {
            const pct = d.active_calories / maxCal
            const isPeak = d.active_calories === maxCal
            const dayWorkouts = workoutsByDate[d.date] ?? []
            const barHeight = Math.max(Math.round(pct * 104), 6)

            return (
              <div
                key={d.date}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {/* PEAK badge (only on peak day) */}
                {isPeak && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7, duration: 0.3 }}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '7px',
                      letterSpacing: '0.16em',
                      color: 'var(--color-black)',
                      background: 'var(--accent-amber)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontWeight: 600,
                    }}
                  >
                    PEAK
                  </motion.div>
                )}

                {/* Workout icons */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    minHeight: isPeak ? '38px' : '50px',
                    justifyContent: 'flex-end',
                  }}
                >
                  {dayWorkouts.slice(0, 3).map(activity => {
                    const Icon =
                      ACTIVITY_SVG_ICONS[activity] ??
                      ACTIVITY_SVG_ICONS['Unknown Activity']
                    return (
                      <Icon
                        key={activity}
                        size={13}
                        color={isPeak ? 'var(--accent-amber)' : 'var(--color-mid)'}
                      />
                    )
                  })}
                </div>

                {/* Calorie label */}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: isPeak ? '14px' : '12px',
                    color: isPeak ? 'var(--accent-amber)' : 'var(--color-white)',
                    textAlign: 'center',
                    lineHeight: 1,
                    letterSpacing: '0.5px',
                  }}
                >
                  {d.active_calories >= 1000
                    ? (d.active_calories / 1000).toFixed(1) + 'k'
                    : d.active_calories}
                </div>

                {/* Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '104px',
                    display: 'flex',
                    alignItems: 'flex-end',
                  }}
                >
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: barHeight }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: '100%',
                      borderRadius: '3px 3px 0 0',
                      background: isPeak
                        ? 'var(--accent-amber)'
                        : `rgba(36, 139, 245, ${0.25 + pct * 0.75})`,
                      boxShadow: isPeak ? '0 0 20px rgba(255, 170, 34, 0.35)' : 'none',
                    }}
                  />
                </div>

                {/* Day label */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '9px',
                    letterSpacing: '0.08em',
                    color: isPeak ? 'var(--accent-amber)' : 'var(--color-mid)',
                    textAlign: 'center',
                    fontWeight: isPeak ? 600 : 400,
                  }}
                >
                  {DAY_LABELS[i]}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
