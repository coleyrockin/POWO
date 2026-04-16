'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { DailyMetric } from '@/lib/types'

interface Props { daily: DailyMetric[] }

const DAY_LABELS = ['Apr 8','Apr 9','Apr 10','Apr 11','Apr 12','Apr 13','Apr 14']

function MiniChart({ values, color, max }: { values: (number | null)[], color: string, max: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
      {values.map((v, i) => {
        if (v === null) return null
        const pct = Math.round((v / max) * 100)
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)' }}>
            <span style={{ width: '40px', flexShrink: 0 }}>{DAY_LABELS[i]}</span>
            <div style={{ flex: 1, height: '3px', borderRadius: '2px', background: 'var(--color-dim)', overflow: 'hidden' }}>
              <div style={{ height: '3px', borderRadius: '2px', background: color, width: `${pct}%` }} />
            </div>
            <span style={{ width: '32px', textAlign: 'right', color: 'var(--color-white)' }}>{v}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function CardiacMetrics({ daily }: Props) {
  const vitals = [
    { label: 'Resting Heart Rate',  main: '65 bpm',   sub: '7-day avg · range 55–75',       good: true,  values: daily.map(d => d.resting_heart_rate),          max: 100, color: 'var(--color-blue)' },
    { label: 'HRV',                    main:'55 ms',   sub: 'SDNN avg · peak 71 ms',          good: true,  values: daily.map(d => Math.round(d.hrv_ms)),          max: 100, color: 'var(--color-wolf)' },
    { label: 'Average Heart Rate',   main: '89 bpm',  sub: 'all-day avg',                    good: false, values: daily.map(d => Math.round(d.avg_heart_rate)),  max: 150, color: 'var(--color-blue)' },
    { label: 'Walking HR Avg',       main: '107 bpm', sub: 'includes sprints/jogs',          good: false, values: daily.map(d => Math.round(d.walking_heart_rate)),max:160, color: 'var(--color-wolf)' },
    { label: 'Resp Rate',             main: '14.8 br/m',sub:'sleep avg · range 13.5–16.3',   good: true,  values: daily.map(d => d.respiratory_rate) as (number|null)[], max:20, color:'var(--color-wolf)' },
    { label: 'Wrist Temp',           main: '35.2 °C', sub: 'sleep baseline',                good: false, values: daily.map(d => d.wrist_temp_c),                max: 36,  color: '#ff6666' },
  ]

  return (
    <section>
      <SectionHeader label="Cardiac Metrics" meta="daily trends" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {vitals.map((v, i) => (
          <motion.div
            key={v.label}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            style={{ background: 'var(--color-card)', padding: '14px 12px' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '6px' }}>{v.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', lineHeight: 1, color: v.good ? 'var(--color-wolf)' : 'var(--color-white)' }}>{v.main}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '4px' }}>{v.sub}</div>
            <MiniChart values={v.values} color={v.color} max={v.max} />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
