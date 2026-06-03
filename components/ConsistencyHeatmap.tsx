'use client'
import { m } from 'framer-motion'
import SectionHeader from './SectionHeader'
import CountUp from './CountUp'
import { buildConsistency } from '@/lib/helpers'
import type { DailyMetric, Workout } from '@/lib/types'

interface Props {
  daily: DailyMetric[]
  workouts: Workout[]
}

// Faint-dim → pure-green ramp, GitHub-contributions style.
const BUCKET_COLORS = [
  'var(--color-dim)',
  'color-mix(in srgb, var(--accent-green) 18%, var(--color-card))',
  'color-mix(in srgb, var(--accent-green) 40%, var(--color-card))',
  'color-mix(in srgb, var(--accent-green) 66%, var(--color-card))',
  'var(--accent-green)',
]

export default function ConsistencyHeatmap({ daily, workouts }: Props) {
  // Cell/gap size is CSS-driven (.powo-heat sets --heat-cell / --heat-gap, widened
  // at >=641px) so SSR and client render identically — no hydration flash.
  if (daily.length === 0) return null

  const c = buildConsistency(daily, workouts)
  const firstDow = new Date(daily[0].date + 'T00:00:00').getDay()

  // Lead with empty pad cells so day 0 lands on its real weekday row (Sun=top).
  type Cell = { kind: 'pad' } | { kind: 'day'; day: (typeof c.days)[number] }
  const cells: Cell[] = [
    ...Array.from({ length: firstDow }, (): Cell => ({ kind: 'pad' })),
    ...c.days.map((day): Cell => ({ kind: 'day', day })),
  ]

  // Month label → the grid column where each month first appears.
  const monthLabels: { label: string; col: number }[] = []
  const seenMonths = new Set<string>()
  c.days.forEach((day, i) => {
    const mo = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    if (!seenMonths.has(mo)) {
      seenMonths.add(mo)
      monthLabels.push({ label: mo, col: Math.floor((i + firstDow) / 7) })
    }
  })

  const tiles = [
    { label: 'Current Streak', val: c.currentStreak, unit: 'days', color: 'var(--accent-green)' },
    { label: 'Longest Streak', val: c.longestStreak, unit: 'days', color: 'var(--accent-teal)' },
    { label: 'Active Days', val: c.totalActiveDays, unit: `/ ${daily.length}`, color: 'var(--accent-amber)' },
  ]

  return (
    <section id="consistency">
      <SectionHeader label="Consistency" meta={`${c.totalActiveDays} active · ${Math.round(c.pctActive)}%`} />
      <m.div
        className="powo-heat"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '18px 14px' }}
      >
        {/* Month labels — aligned to the grid columns below */}
        <div style={{ position: 'relative', height: '12px', marginBottom: '5px' }}>
          {monthLabels.map(m => (
            <span
              key={m.label}
              style={{ position: 'absolute', left: `calc(${m.col} * (var(--heat-cell) + var(--heat-gap)))`, top: 0, fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--color-mid)' }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Day grid — weeks as columns, weekdays as the 7 rows */}
        <div
          role="img"
          aria-label={`Daily activity heatmap, ${daily.length} days. ${c.totalActiveDays} active days, ${Math.round(c.pctActive)} percent. Current streak ${c.currentStreak} days, longest ${c.longestStreak}.`}
          style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateRows: 'repeat(7, var(--heat-cell))', gridAutoColumns: 'var(--heat-cell)', gap: 'var(--heat-gap)' }}
        >
          {cells.map((cell, i) =>
            cell.kind === 'pad' ? (
              <div key={`p${i}`} aria-hidden style={{ width: 'var(--heat-cell)', height: 'var(--heat-cell)' }} />
            ) : (
              <div
                key={cell.day.date}
                title={`${cell.day.date} · ${cell.day.isPartial ? 'no data' : `${cell.day.activeKcal ?? '--'} kcal · ${cell.day.exerciseMin ?? '--'} min${cell.day.workoutCount ? ` · ${cell.day.workoutCount} workout${cell.day.workoutCount > 1 ? 's' : ''}` : ''}`}`}
                style={cell.day.isPartial
                  ? { width: 'var(--heat-cell)', height: 'var(--heat-cell)', borderRadius: '2px', background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--hairline)' }
                  : { width: 'var(--heat-cell)', height: 'var(--heat-cell)', borderRadius: '2px', background: BUCKET_COLORS[cell.day.bucket] }}
              />
            ),
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)', letterSpacing: '0.08em' }}>
          <span>LESS</span>
          {BUCKET_COLORS.map((bg, i) => (
            <span key={i} aria-hidden style={{ width: '9px', height: '9px', borderRadius: '2px', background: bg, display: 'inline-block' }} />
          ))}
          <span>MORE</span>
          <span aria-hidden style={{ width: '9px', height: '9px', borderRadius: '2px', background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--hairline)', display: 'inline-block', marginLeft: '10px' }} />
          <span>NO DATA</span>
        </div>

        {/* Streak stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
          {tiles.map((t, i) => (
            <m.div
              key={t.label}
              initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="powo-trophy"
              style={{ ['--trophy-color' as string]: t.color, borderRadius: '8px', padding: '13px 8px 11px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', textAlign: 'center', isolation: 'isolate' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-mid)', position: 'relative', zIndex: 2 }}>{t.label}</span>
              <CountUp
                value={t.val}
                className="powo-glow-white"
                style={{ fontFamily: 'var(--font-display)', fontSize: '30px', lineHeight: 1, color: 'var(--color-white)', position: 'relative', zIndex: 2 }}
              />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-faint)', position: 'relative', zIndex: 2 }}>{t.unit}</span>
            </m.div>
          ))}
        </div>
      </m.div>
    </section>
  )
}
