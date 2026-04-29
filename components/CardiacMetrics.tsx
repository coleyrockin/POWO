'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { DailyMetric, HealthData } from '@/lib/types'
import { avg, maxOf, minOf } from '@/lib/helpers'

interface Props { data: HealthData }

function Sparkline({ values, color, max, min }: { values: (number | null)[], color: string, max: number, min: number }) {
  const W = 280, H = 32, PAD = 2
  const range = max - min || 1
  const present = values
    .map((v, i) => (typeof v === 'number' ? { i, v } : null))
    .filter((p): p is { i: number; v: number } => p !== null)
  if (present.length < 2) return null
  const points = present.map(({ i, v }) => {
    const x = (i / (values.length - 1)) * (W - PAD * 2) + PAD
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2)
    return `${x},${y}`
  }).join(' ')
  const lastPt = present[present.length - 1]
  const lastX = (lastPt.i / (values.length - 1)) * (W - PAD * 2) + PAD
  const lastY = H - PAD - ((lastPt.v - min) / range) * (H - PAD * 2)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '34px' }} preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity={0.85} />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
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
      <SectionHeader label="Cardiac Metrics" meta="91-day baseline · 14-day trend" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignItems: 'stretch', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {tiles.map((v, i) => {
          const dirArrow = v.delta === null ? '' : v.delta > 0 ? '↑' : v.delta < 0 ? '↓' : '·'
          const deltaStr = v.delta !== null ? `${dirArrow} ${Math.abs(v.delta).toFixed(v.decimals)}` : '—'
          return (
            <motion.div key={v.label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="powo-lift"
              style={{ background: 'var(--color-card)', padding: '16px 14px', minHeight: '154px', height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-white)', marginBottom: '6px' }}>{v.label}</div>
              <div className={
                v.color === 'var(--accent-blue)'   ? 'powo-glow-blue'   :
                v.color === 'var(--accent-green)'  ? 'powo-glow-green'  :
                v.color === 'var(--accent-amber)'  ? 'powo-glow-amber'  :
                v.color === 'var(--accent-coral)'  ? 'powo-glow-coral'  :
                v.color === 'var(--accent-purple)' ? 'powo-glow-purple' :
                v.color === 'var(--accent-teal)'   ? 'powo-glow-teal'   : ''
              } style={{ fontFamily: 'var(--font-display)', fontSize: '24px', lineHeight: 1, color: v.color }}>{v.baseline.toFixed(v.decimals)}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '4px' }}>{v.unit} · 91-day baseline</div>
              <div style={{ marginTop: '8px' }}>
                <Sparkline values={v.vals} color={v.color} max={v.sparkMax} min={v.sparkMin} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: 'var(--font-mono)', fontSize: '10px', marginTop: '2px', gap: '6px' }}>
                <span style={{ color: 'var(--color-mid)' }}>14d {v.recent !== null ? v.recent.toFixed(v.decimals) : '—'}</span>
                <span style={{ color: v.color }}>{deltaStr}</span>
                <span style={{ color: 'var(--color-mid)' }}>{v.lo !== null && v.hi !== null ? `${v.lo.toFixed(v.decimals)}–${v.hi.toFixed(v.decimals)}` : ''}</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
