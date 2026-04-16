'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { SleepNight } from '@/lib/types'

interface Props { sleep: SleepNight[] }

function fmtNight(night: string) {
  const parts = night.split(' to ')
  const d1 = new Date(parts[0] + 'T00:00:00')
  const d2 = new Date(parts[1] + 'T00:00:00')
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(d1)} → ${fmt(d2)}`.toUpperCase()
}

export default function SleepAnalysis({ sleep }: Props) {
  const MAX_MIN = 170

  return (
    <section>
      <SectionHeader label="Sleep Analysis" meta={`${sleep.length} nights tracked`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {sleep.map((s, i) => {
          const h = Math.floor(s.total_min / 60)
          const m = s.total_min % 60
          const stages = [
            { label: 'Deep',  min: s.deep_min,  color: 'var(--color-blue)', max: MAX_MIN },
            { label: 'REM',   min: s.rem_min,   color: 'var(--color-wolf)', max: MAX_MIN },
            { label: 'Core',  min: s.core_min,  color: '#444444',           max: 500 },
          ]
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{ background: 'var(--color-card)', padding: '18px 16px' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--color-mid)', marginBottom: '10px' }}>{fmtNight(s.night)}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '34px', lineHeight: 1, marginBottom: '4px' }}>{h}h {m}m</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)', marginBottom: '14px' }}>{s.bedtime} → {s.wake_time}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {stages.map(st => (
                  <div key={st.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color, flexShrink: 0 }} />
                    <span style={{ width: '36px', color: 'var(--color-mid)' }}>{st.label}</span>
                    <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'var(--color-dim)', overflow: 'hidden' }}>
                      <div style={{ height: '3px', borderRadius: '2px', background: st.color, width: `${Math.min((st.min / st.max) * 100, 100)}%` }} />
                    </div>
                    <span style={{ width: '48px', textAlign: 'right', color: 'var(--color-white)' }}>{st.min} min</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
