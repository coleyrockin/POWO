'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { PushupData } from '@/lib/types'

interface Props { pushups: PushupData }

function fmtRange(week: string) {
  const [s, e] = week.split('/')
  const fmt = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(s)} – ${fmt(e)}`
}

export default function PushupLog({ pushups }: Props) {
  const weeks = pushups.weeks
  const total = weeks.reduce((a, w) => a + w.total, 0)
  const bestWeek = weeks.reduce((a, b) => (b.total > a.total ? b : a))
  const max = bestWeek.total

  return (
    <section id="pushups">
      <SectionHeader label="Pushup Log" meta={`${total} reps · ${weeks.length} weeks`} />
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {weeks.map((w, i) => {
            const isBest = w.total === max
            const pct = (w.total / max) * 100
            return (
              <motion.div key={w.week}
                initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                style={{ position: 'relative', padding: '14px 14px', border: isBest ? '1px solid rgba(255,170,34,0.42)' : '1px solid var(--color-border)', borderRadius: '6px', background: isBest ? 'linear-gradient(180deg, #1f1605 0%, #120c02 100%)' : 'rgba(255,255,255,0.035)', boxShadow: isBest ? 'inset 0 1px 0 rgba(255,170,34,0.18), 0 0 24px rgba(255,170,34,0.08)' : 'inset 0 1px 0 rgba(255,255,255,0.035)' }}
              >
                {isBest && (
                  <span style={{ position: 'absolute', top: '10px', right: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-black)', background: 'var(--accent-amber)', padding: '2px 6px', borderRadius: '2px', fontWeight: 700 }}>PEAK</span>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', color: 'var(--color-mid)', textTransform: 'uppercase' }}>{fmtRange(w.week)}</span>
                  <span className={isBest ? 'powo-glow-amber' : ''} style={{ fontFamily: 'var(--font-display)', fontSize: '32px', lineHeight: 1, color: isBest ? 'var(--accent-amber)' : 'var(--color-white)' }}>{w.total}<span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)', marginLeft: '6px', textShadow: 'none' }}>reps</span></span>
                </div>
                <div style={{ height: '7px', borderRadius: '3px', background: '#0a0a0a', overflow: 'hidden', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.5)' }}>
                  <motion.div
                    className="powo-comet"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.85, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      ['--bar-color' as string]: isBest ? 'var(--accent-amber)' : '#6a7484',
                      height: '7px',
                      borderRadius: '3px',
                    }}
                  />
                </div>
                {w.sessions.length > 0 && (
                  <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {w.sessions.map((s, j) => (
                      <span key={j} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', padding: '2px 6px', background: '#0a0a0a', border: '1px solid var(--color-border)', color: 'var(--color-white)', borderRadius: '2px' }}>
                        <span style={{ color: 'var(--color-mid)' }}>{new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span style={{ color: 'var(--color-mid)' }}> · </span>
                        {s.reps}
                      </span>
                    ))}
                  </div>
                )}
                {w.notes && (
                  <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--accent-blue-dim)' }}>NOTE</span> · {w.notes}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
