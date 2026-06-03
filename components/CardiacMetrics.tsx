'use client'
import { useRef } from 'react'
import { m } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { useChartCursor } from './useChartCursor'
import { ChartLiveRegion } from './ChartCursor'
import type { DailyMetric, HealthData } from '@/lib/types'
import { avg, maxOf, minOf } from '@/lib/helpers'

interface Props { data: HealthData }

function Sparkline({ values, color, max, min, dates, unit, decimals }: { values: (number | null)[], color: string, max: number, min: number, dates: string[], unit: string, decimals: number }) {
  const W = 280, H = 32, PAD = 2
  const range = max - min || 1
  const svgRef = useRef<SVGSVGElement>(null)
  const present = values
    .map((v, i) => (typeof v === 'number' ? { i, v } : null))
    .filter((p): p is { i: number; v: number } => p !== null)
  const coords = present.map(({ i, v }) => ({ x: (i / (values.length - 1)) * (W - PAD * 2) + PAD, i, v }))
  const { activeIndex, handlers } = useChartCursor({ coords, svgRef, enabled: present.length >= 2 })
  if (present.length < 2) return null
  const points = present.map(({ i, v }) => {
    const x = (i / (values.length - 1)) * (W - PAD * 2) + PAD
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
    return `${x},${y}`
  }).join(' ')
  const lastPt = present[present.length - 1]
  const lastX = (lastPt.i / (values.length - 1)) * (W - PAD * 2) + PAD
  const lastY = H - PAD - ((lastPt.v - min) / range) * (H - PAD * 2)

  const active = activeIndex !== null ? coords[activeIndex] : null
  const leftPct = active ? (active.x / W) * 100 : 0
  const tipLeft = Math.max(12, Math.min(leftPct, 88))
  const activeDate = active ? new Date(dates[active.i] + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

  return (
    <div style={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="application"
        aria-roledescription="interactive sparkline"
        aria-label={`14-day trend${active ? `, ${activeDate}: ${active.v.toFixed(decimals)} ${unit}` : '. Use arrow keys to inspect.'}`}
        {...handlers}
        style={{ width: '100%', height: '34px', ...handlers.style }}
        preserveAspectRatio="none"
      >
        <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
        <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
      </svg>
      {active && (
        <>
          <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: `${leftPct}%`, width: '1px', background: color, opacity: 0.6, pointerEvents: 'none' }} />
          <div aria-hidden style={{ position: 'absolute', bottom: '100%', left: `${tipLeft}%`, transform: 'translate(-50%, -3px)', background: 'var(--tooltip-bg)', border: `1px solid ${color}`, borderRadius: '4px', padding: '3px 7px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.45)' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: '#b9b9bd' }}>{activeDate} · </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color }}>{active.v.toFixed(decimals)} {unit}</span>
          </div>
        </>
      )}
      <ChartLiveRegion message={active ? `${activeDate}: ${active.v.toFixed(decimals)} ${unit}` : ''} />
    </div>
  )
}

export default function CardiacMetrics({ data }: Props) {
  const last14 = data.daily.slice(-14)
  const all = data.daily
  const a = data.summary.averages

  const tile = (
    label: string,
    accessor: (d: DailyMetric) => number | null,
    decimals: number,
    unit: string,
    color: string,
    customMain?: number,
  ) => {
    const allVals = all.map(accessor)
    const last14Vals = last14.map(accessor)
    const baseline = customMain !== undefined ? customMain : (avg(allVals) ?? 0)
    const recent = avg(last14Vals)
    const delta = recent !== null ? recent - baseline : null
    const lo = minOf(last14Vals)
    const hi = maxOf(last14Vals)
    const sparkMax = (maxOf(allVals) ?? 100)
    const sparkMin = (minOf(allVals) ?? 0)
    return { label, baseline, recent, delta, lo, hi, color, vals: last14Vals, decimals, unit, sparkMax: sparkMax + 2, sparkMin: sparkMin - 2 }
  }

  const tiles = [
    tile('Resting HR', d => d.resting_hr, 1, 'bpm', 'var(--accent-coral)', a.avg_resting_hr),
    tile('HRV (SDNN)', d => d.hrv_ms, 1, 'ms', 'var(--accent-green)', a.avg_hrv_ms),
    tile('All-day HR', d => d.avg_hr, 1, 'bpm', 'var(--accent-blue)'),
    tile('Walking HR', d => d.walking_hr, 1, 'bpm', 'var(--accent-amber)'),
    tile('Respiration', d => d.respiratory_rate, 1, 'br/min', 'var(--accent-teal)'),
    tile('SpO₂',        d => d.spo2_pct, 1, '%', 'var(--accent-purple)'),
  ]

  return (
    <section id="cardiac">
      <SectionHeader label="Cardiac Metrics" meta={`${data.meta.period.days}-day baseline · 14-day trend`} />
      <div className="powo-grid-cardiac" style={{ display: 'grid', alignItems: 'stretch', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {tiles.map((v, i) => {
          const dirArrow = v.delta === null ? '' : v.delta > 0 ? '↑' : v.delta < 0 ? '↓' : '·'
          const deltaStr = v.delta !== null ? `${dirArrow} ${Math.abs(v.delta).toFixed(v.decimals)}` : '—'
          return (
            <m.div key={v.label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="powo-lift"
              style={{ background: 'var(--color-card)', padding: '16px 14px', minHeight: '154px', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-white)', marginBottom: '6px' }}>{v.label}</div>
              <div className="powo-glow-white" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', lineHeight: 1, color: 'var(--color-white)' }}>{v.baseline.toFixed(v.decimals)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '4px' }}>{v.unit} · {data.meta.period.days}-day baseline</div>
              <div style={{ marginTop: '8px' }}>
                <Sparkline values={v.vals} color={v.color} max={v.sparkMax} min={v.sparkMin} dates={last14.map(d => d.date)} unit={v.unit} decimals={v.decimals} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px', gap: '6px' }}>
                <span style={{ color: 'var(--color-mid)' }}>14d {v.recent !== null ? v.recent.toFixed(v.decimals) : '—'}</span>
                <span style={{ color: v.color }}>{deltaStr}</span>
                <span style={{ color: 'var(--color-mid)' }}>{v.lo !== null && v.hi !== null ? `${v.lo.toFixed(v.decimals)}–${v.hi.toFixed(v.decimals)}` : ''}</span>
              </div>
            </m.div>
          )
        })}
      </div>
    </section>
  )
}
