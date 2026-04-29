'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { HealthData } from '@/lib/types'
import { buildWeekChange } from '@/lib/helpers'

interface Props { data: HealthData }

function ArrowFor(delta: number, good: 'up' | 'down' | 'neutral'): { arrow: string; color: string } {
  if (Math.abs(delta) < 0.5) return { arrow: '·', color: 'var(--color-mid)' }
  const isUp = delta > 0
  const isGood = (isUp && good === 'up') || (!isUp && good === 'down') || good === 'neutral'
  return {
    arrow: isUp ? '↑' : '↓',
    color: isGood ? 'var(--accent-green)' : 'var(--accent-coral)',
  }
}

export default function WeekChange({ data }: Props) {
  const wc = buildWeekChange(data.daily)
  const last7 = data.daily.slice(-7)
  const prev7 = data.daily.slice(-14, -7)
  const start = last7[0]?.date
  const end = last7[last7.length - 1]?.date
  const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const METRIC_COLORS = ['var(--accent-green)', 'var(--accent-amber)', 'var(--accent-blue)', 'var(--accent-coral)', 'var(--accent-teal)']
  const GLOW_CLASSES = ['powo-glow-green', 'powo-glow-amber', 'powo-glow-blue', 'powo-glow-coral', 'powo-glow-teal']

  return (
    <section id="week-change">
      <SectionHeader label="Week-Over-Week" meta={`${fmt(start)} – ${fmt(end)} vs prior 7d`} />
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '8px' }}>
          {wc.map((m, i) => {
            const delta = m.deltaPct ?? 0
            const { arrow, color } = ArrowFor(delta, m.goodDirection)
            const accentColor = METRIC_COLORS[i]
            const glowClass = GLOW_CLASSES[i]
            const main = m.current !== null
              ? (m.label === 'Steps' ? Math.round(m.current).toLocaleString()
                : m.label === 'Active kcal' ? Math.round(m.current).toLocaleString()
                : m.label === 'Exercise min' ? Math.round(m.current).toString()
                : m.current.toFixed(1))
              : '—'
            return (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                className="powo-trophy"
                style={{
                  ['--trophy-color' as string]: accentColor,
                  minHeight: '88px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '3px',
                  textAlign: 'center',
                  padding: '10px 4px',
                  borderRadius: '6px',
                  isolation: 'isolate',
                }}
              >
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--color-mid)', textTransform: 'uppercase', position: 'relative', zIndex: 2 }}>{m.label}</div>
                <div className={glowClass} style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: accentColor, lineHeight: 1, marginTop: '4px', position: 'relative', zIndex: 2 }}>{main}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color, fontWeight: 600, marginTop: '4px', position: 'relative', zIndex: 2 }}>
                  {arrow} {m.deltaPct !== null ? `${Math.abs(m.deltaPct).toFixed(0)}%` : '—'}
                </div>
              </motion.div>
            )
          })}
        </div>
        <div style={{ marginTop: '12px', padding: '10px 10px 0', borderTop: '1px dashed rgba(255,255,255,0.08)', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', lineHeight: 1.5 }}>
          <span style={{ color: 'var(--color-mid)', fontWeight: 600, letterSpacing: '0.08em' }}>READ</span> · {(() => {
            const stepsDelta = wc[0].deltaPct ?? 0
            const rhrDelta = wc[3].deltaPct ?? 0
            const hrvDelta = wc[4].deltaPct ?? 0
            const parts: string[] = []
            if (Math.abs(stepsDelta) > 5) parts.push(`Activity ${stepsDelta > 0 ? 'up' : 'down'} ${Math.abs(stepsDelta).toFixed(0)}%`)
            if (Math.abs(rhrDelta) > 2) parts.push(`RHR ${rhrDelta > 0 ? 'up — fatigue signal' : 'down — recovering'}`)
            if (Math.abs(hrvDelta) > 5) parts.push(`HRV ${hrvDelta > 0 ? 'up — parasympathetic recovery' : 'down — stress accumulating'}`)
            return parts.length > 0 ? parts.join(' · ') : 'Week-over-week change minimal — steady state.'
          })()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-dim)', marginTop: '8px' }}>
          <span>last 7d {fmt(last7[0].date)} – {fmt(last7[6].date)}</span>
          <span>prior 7d {fmt(prev7[0].date)} – {fmt(prev7[6].date)}</span>
        </div>
      </div>
    </section>
  )
}
