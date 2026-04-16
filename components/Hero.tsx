'use client'
import { motion } from 'framer-motion'
import type { WeekData } from '@/lib/types'

interface Props { data: WeekData }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

export default function Hero({ data }: Props) {
  const s = data.weekly_summary
  const [weekStart, weekEnd] = data.week.split(' to ')
  const fmtDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
  }

  const kpis = [
    { val: s.vo2_max.toFixed(1),                    label: 'VO₂ MAX' },
    { val: (s.steps_total / 1000).toFixed(0) + 'K', label: 'STEPS THIS WEEK' },
    { val: s.active_calories_total.toLocaleString(), label: 'ACTIVE CAL' },
    { val: s.exercise_minutes_total.toString(),      label: 'EXERCISE MIN' },
    { val: s.workout_sessions.toString(),            label: 'WORKOUT SESSIONS' },
  ]

  return (
    <header style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--color-border)', padding: '56px 24px 40px' }}>
      {/* Ghost bg text */}
      <div
        style={{
          position: 'absolute', right: '-20px', top: '-10px',
          fontFamily: 'var(--font-display)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          fontSize: 'clamp(90px, 28vw, 200px)',
          WebkitTextStroke: '1px #1a1a1a', color: 'transparent', letterSpacing: '-4px',
        }}
        aria-hidden
      >
        POWO
      </div>

      {/* Apple Health badge */}
      <motion.div {...fadeUp(0.05)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'var(--color-wolf)', color: 'var(--color-black)',
        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        padding: '5px 12px', marginBottom: '20px',
      }}>
        <span style={{ fontSize: '11px' }}>✓</span> Apple Health Verified
      </motion.div>

      {/* Title */}
      <motion.h1
        {...fadeUp(0.1)}
        style={{
          fontFamily: 'var(--font-display)', lineHeight: 0.88, letterSpacing: '2px',
          fontSize: 'clamp(56px, 18vw, 120px)', marginBottom: '6px',
        }}
      >
        <span style={{ color: 'var(--color-wolf)' }}>PO</span><span style={{ color: 'var(--color-white)' }}>WO</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.div {...fadeUp(0.15)} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)', letterSpacing: '0.04em', marginTop: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        COLEY &nbsp;·&nbsp;{' '}
        <span style={{ color: 'var(--color-wolf2)' }}>{fmtDate(weekStart)} – {fmtDate(weekEnd)}, 2026</span>
        &nbsp;·&nbsp; WEEK 15
      </motion.div>

      {/* KPIs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px 28px', marginTop: '28px', paddingTop: '28px', borderTop: '1px solid var(--color-border)' }}>
        {kpis.map((k, i) => (
          <motion.div key={k.label} {...fadeUp(0.2 + i * 0.06)} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '38px', lineHeight: 1, color: 'var(--color-wolf)' }}>{k.val}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)' }}>{k.label}</span>
          </motion.div>
        ))}
      </div>
    </header>
  )
}
