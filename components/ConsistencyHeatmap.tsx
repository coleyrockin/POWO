'use client'
import { m } from 'framer-motion'
import SectionHeader from './SectionHeader'
import CountUp from './CountUp'
import { buildConsistency } from '@/lib/helpers'
import type { DailyMetric, Workout } from '@/lib/types'

// Faint-dim → pure-green ramp, GitHub-contributions style.
const BUCKET_COLORS = [
  'var(--color-dim)',
  'color-mix(in srgb, var(--accent-green) 18%, var(--color-card))',
  'color-mix(in srgb, var(--accent-green) 40%, var(--color-card))',
  'color-mix(in srgb, var(--accent-green) 66%, var(--color-card))',
  'var(--accent-green)',
]

interface Props {
  daily: DailyMetric[]
  workouts: Workout[]
}

export default function ConsistencyHeatmap({ daily, workouts }: Props) {
  if (daily.length === 0) return null

  const c = buildConsistency(daily, workouts)
  const firstDow = new Date(daily[0].date + 'T00:00:00').getDay()

  // The grid is fluid: week-columns are 1fr tracks and each cell carries
  // aspect-ratio:1, so the heatmap always fills its card width exactly — no
  // overflow in the narrow desktop masonry column, no dead space on iPad. The
  // week count drives the column track (--heat-weeks); SSR and client agree, so
  // there's no hydration flash. --heat-gap (set in globals.css) widens >=640px.
  const weeks = Math.ceil((firstDow + c.days.length) / 7)

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
        style={{ ['--heat-weeks' as string]: weeks, position: 'relative', background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '18px 14px' }}
      >
        {/* Month labels — placed on the same column track as the grid below, so
            they stay aligned to the week columns at any fluid cell width. */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(var(--heat-weeks), 1fr)', gap: 'var(--heat-gap)', height: '12px', marginBottom: '5px' }}>
          {monthLabels.map(label => (
            <span
              key={label.label}
              style={{ gridColumnStart: label.col + 1, fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--color-mid)', whiteSpace: 'nowrap' }}
            >
              {label.label}
            </span>
          ))}
        </div>

        {/* Day grid — weeks as columns, weekdays as the 7 rows */}
        <div
          role="img"
          aria-label={`Daily activity heatmap, ${daily.length} days. ${c.totalActiveDays} active days, ${Math.round(c.pctActive)} percent. Current streak ${c.currentStreak} days, longest ${c.longestStreak}.`}
          style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateColumns: 'repeat(var(--heat-weeks), 1fr)', gridTemplateRows: 'repeat(7, auto)', gap: 'var(--heat-gap)' }}
        >
          {cells.map((cell, i) =>
            cell.kind === 'pad' ? (
              <div key={`p${i}`} aria-hidden style={{ width: '100%', aspectRatio: '1' }} />
            ) : (
              <div
                key={cell.day.date}
                className="powo-heat-cell"
                title={`${cell.day.date} · ${cell.day.isPartial ? 'no data' : `${cell.day.activeKcal ?? '--'} kcal · ${cell.day.exerciseMin ?? '--'} min${cell.day.workoutCount ? ` · ${cell.day.workoutCount} workout${cell.day.workoutCount > 1 ? 's' : ''}` : ''}`}`}
                style={cell.day.isPartial
                  ? { width: '100%', aspectRatio: '1', borderRadius: '2px', background: 'transparent', boxShadow: 'inset 0 0 0 1px var(--hairline)' }
                  : { width: '100%', aspectRatio: '1', borderRadius: '2px', background: BUCKET_COLORS[cell.day.bucket] }}
              />
            ),
          )}
        </div>

        {/* Screen-reader detail the role="img" grid can't convey cell-by-cell */}
        <p style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
          {`Of ${daily.length} days: ${c.totalActiveDays} active, ${c.days.filter(d => d.isPartial).length} without data. Activity runs ${c.days[0]?.date ?? ''} through ${c.days[c.days.length - 1]?.date ?? ''}.`}
        </p>

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
