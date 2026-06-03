'use client'
import { useState } from 'react'
import { m as Motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { lastNDays, sum, avg, buildConsistency } from '@/lib/helpers'
import type { DailyMetric, Workout } from '@/lib/types'

interface Props { daily: DailyMetric[]; workouts: Workout[] }

const BASE_WINDOWS = [7, 30, 90] as const

interface WindowMetrics {
  steps: number
  kcal: number
  exMin: number
  workouts: number
  rhr: number | null
  hrv: number | null
  activePct: number
}

function buildWindowMetrics(daily: DailyMetric[], workouts: Workout[]): WindowMetrics {
  return {
    steps: sum(daily.map(d => d.steps)),
    kcal: sum(daily.map(d => d.active_kcal)),
    exMin: sum(daily.map(d => d.exercise_min)),
    workouts: workouts.length,
    rhr: avg(daily.map(d => d.resting_hr)),
    hrv: avg(daily.map(d => d.hrv_ms)),
    activePct: buildConsistency(daily, workouts).pctActive,
  }
}

const fmtInt = (n: number) => Math.round(n).toLocaleString()

export default function DashboardShell({ daily, workouts }: Props) {
  const ALL = daily.length
  const windows: number[] = [...BASE_WINDOWS.filter(w => w < ALL), ALL]
  const [win, setWin] = useState<number>(() => daily.length)
  const [compareOn, setCompareOn] = useState(false)
  const isAll = win >= ALL

  const sliced = lastNDays(daily, win)
  const cutoff = sliced[0]?.date ?? ''
  const slicedW = workouts.filter(w => w.date >= cutoff)

  const prev = daily.slice(-2 * win, -win)
  const prevCutoff = prev[0]?.date ?? ''
  const prevW = prev.length ? workouts.filter(w => w.date >= prevCutoff && w.date < cutoff) : []

  const compare = compareOn && !isAll && prev.length > 0
  const m = buildWindowMetrics(sliced, slicedW)
  const pm = compare ? buildWindowMetrics(prev, prevW) : null

  const rangeLabel = sliced.length
    ? `${new Date(cutoff + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(sliced[sliced.length - 1].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    : ''

  type Tile = { label: string; value: string; raw: number | null; prev: number | null; good: 'up' | 'down'; color: string }
  // Explore leads with the recovery/consistency lens (RHR/HRV/active days) — the
  // angle the vibrant hero totals strip doesn't emphasize — then volume. This,
  // plus the windowing + vs-prior deltas, differentiates it from the hero row.
  const tiles: Tile[] = [
    { label: 'Avg RHR', value: m.rhr !== null ? m.rhr.toFixed(0) : '—', raw: m.rhr, prev: pm?.rhr ?? null, good: 'down', color: 'var(--accent-teal)' },
    { label: 'Avg HRV', value: m.hrv !== null ? m.hrv.toFixed(0) : '—', raw: m.hrv, prev: pm?.hrv ?? null, good: 'up', color: 'var(--accent-purple)' },
    { label: 'Active days', value: `${Math.round(m.activePct)}%`, raw: m.activePct, prev: pm?.activePct ?? null, good: 'up', color: 'var(--accent-green)' },
    { label: 'Steps', value: m.steps >= 100000 ? `${(m.steps / 1000).toFixed(0)}K` : fmtInt(m.steps), raw: m.steps, prev: pm?.steps ?? null, good: 'up', color: 'var(--accent-green)' },
    { label: 'Active kcal', value: m.kcal >= 100000 ? `${(m.kcal / 1000).toFixed(0)}K` : fmtInt(m.kcal), raw: m.kcal, prev: pm?.kcal ?? null, good: 'up', color: 'var(--accent-amber)' },
    { label: 'Exercise min', value: fmtInt(m.exMin), raw: m.exMin, prev: pm?.exMin ?? null, good: 'up', color: 'var(--accent-blue)' },
    { label: 'Workouts', value: String(m.workouts), raw: m.workouts, prev: pm?.workouts ?? null, good: 'up', color: 'var(--accent-coral)' },
  ]

  const deltaFor = (t: Tile): { txt: string; color: string } | null => {
    if (!compare || t.raw === null || t.prev === null || t.prev === 0) return null
    const pct = ((t.raw - t.prev) / t.prev) * 100
    if (Math.abs(pct) < 0.5) return { txt: '· flat', color: 'var(--color-mid)' }
    const up = pct > 0
    const goodMove = (up && t.good === 'up') || (!up && t.good === 'down')
    return { txt: `${up ? '↑' : '↓'} ${Math.abs(pct).toFixed(0)}%`, color: goodMove ? 'var(--accent-green)' : 'var(--accent-coral)' }
  }

  return (
    <section id="explore">
      <SectionHeader label="Explore" meta={rangeLabel} />
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        {/* Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div role="group" aria-label="Select window" style={{ display: 'inline-flex', background: 'var(--color-track, #0a0a0a)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            {windows.map(w => {
              const active = w === win
              return (
                <button
                  key={w}
                  onClick={() => setWin(w)}
                  aria-pressed={active}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.06em', fontWeight: 600,
                    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', border: 'none',
                    background: active ? 'var(--accent-blue)' : 'transparent',
                    color: active ? 'var(--on-accent)' : 'var(--color-mid)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  {w === ALL ? 'ALL' : `${w}D`}
                </button>
              )
            })}
          </div>
          <button
            onClick={() => setCompareOn(v => !v)}
            disabled={isAll}
            aria-pressed={compareOn && !isAll}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '7px 12px', borderRadius: '6px', cursor: isAll ? 'not-allowed' : 'pointer',
              border: `1px solid ${compare ? 'var(--accent-blue)' : 'var(--color-dim)'}`,
              background: compare ? 'rgba(10,132,255,0.12)' : 'transparent',
              color: isAll ? 'var(--color-dim)' : compare ? 'var(--accent-blue)' : 'var(--color-mid)',
              opacity: isAll ? 0.5 : 1,
            }}
            title={isAll ? 'No prior period to compare against at full range' : 'Compare to the previous equal window'}
          >
            {compare ? '✓ ' : ''}vs prior {isAll ? '' : `${win}d`}
          </button>
        </div>

        {/* KPI tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: '8px' }}>
          {tiles.map((t, i) => {
            const d = deltaFor(t)
            return (
              <Motion.div
                key={t.label}
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="powo-trophy"
                style={{ ['--trophy-color' as string]: t.color, borderRadius: '8px', padding: '12px 8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', textAlign: 'center', isolation: 'isolate' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-mid)', position: 'relative', zIndex: 2 }}>{t.label}</span>
                <span className="powo-glow-white" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', lineHeight: 1, color: 'var(--color-white)', position: 'relative', zIndex: 2 }}>{t.value}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', minHeight: '12px', color: d?.color ?? 'transparent', position: 'relative', zIndex: 2 }}>{d?.txt ?? '·'}</span>
              </Motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
