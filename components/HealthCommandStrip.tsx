'use client'
import { motion } from 'framer-motion'
import { analyzeRecovery } from '@/lib/helpers'
import type { HealthData } from '@/lib/types'

interface Props {
  data: HealthData
  partialDate?: string
}

function fmtMonthDay(iso: string): string {
  const d = new Date(iso.includes('T') ? iso : `${iso}T00:00:00`)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function buildCoachTakeaway(data: HealthData): string {
  const recovery = analyzeRecovery(data)

  if (recovery.fatigueScore >= 45) {
    return 'Recovery is lagging. Keep the next session Z1/Z2 and avoid shoulder-heavy pressing.'
  }

  if (recovery.loadTrend === 'rising' && recovery.vo2Trend !== 'declining') {
    return 'Load is building cleanly. Keep intensity controlled and protect shoulder range.'
  }

  if (recovery.vo2Trend === 'declining') {
    return 'VO2 is off peak. Prioritize aerobic base work before chasing higher intensity.'
  }

  return 'Baseline looks steady. Keep the next session aerobic, clean, and repeatable.'
}

export default function HealthCommandStrip({ data, partialDate }: Props) {
  const partialDays = data.daily.filter(day =>
    day.active_kcal === null || day.exercise_min === null || day.avg_hr === null || day.hrv_ms === null
  )
  const partialCopy = partialDate ? `${fmtMonthDay(partialDate)} partial` : 'No partial days'
  const partialCountCopy = `${partialDays.length} partial day${partialDays.length === 1 ? '' : 's'}`

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.52, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Data quality and coach takeaway"
      style={{
        padding: '14px',
        borderBottom: '1px solid var(--color-border)',
        background: 'linear-gradient(180deg, rgba(8,8,8,0.98), rgba(8,8,8,0.82))',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '1px',
          border: '1px solid var(--color-border)',
          background: 'var(--color-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div style={{ background: 'linear-gradient(180deg, rgba(17,17,19,0.96), rgba(11,11,13,0.96))', padding: '13px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-blue)', marginBottom: '7px', fontWeight: 700 }}>
            Data Quality
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {[
              `${data.meta.period.days} days`,
              `Latest export ${fmtMonthDay(data.meta.generated_at)}`,
              `Through ${fmtMonthDay(data.meta.period.end)}`,
              partialCountCopy,
              partialCopy,
            ].map(item => (
              <span
                key={item}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  minHeight: '22px',
                  padding: '4px 7px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '4px',
                  background: item.includes('partial') ? 'rgba(255,170,34,0.08)' : 'rgba(255,255,255,0.025)',
                  color: item.includes('partial') ? 'var(--accent-amber)' : 'var(--color-mid)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '9px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  lineHeight: 1.15,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: 'linear-gradient(180deg, rgba(13,24,21,0.96), rgba(8,15,13,0.96))', padding: '13px 14px', borderTop: '2px solid rgba(0,212,170,0.18)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--accent-teal)', marginBottom: '6px', fontWeight: 700 }}>
            Coach Takeaway
          </div>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.5, color: 'var(--color-white)', margin: 0 }}>
            {buildCoachTakeaway(data)}
          </p>
        </div>
      </div>
    </motion.section>
  )
}
