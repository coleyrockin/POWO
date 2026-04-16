'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { WeeklySummary as WS } from '@/lib/types'

interface Props { summary: WS }

export default function WeeklySummary({ summary: s }: Props) {
  const tiles = [
    { label: 'Total Steps',      val: s.steps_total.toLocaleString(),          unit: 'steps',    delta: `↑ ${s.steps_avg_per_day.toLocaleString()} avg/day`, color: 'var(--color-wolf)' },
    { label: 'Active Calories',  val: s.active_calories_total.toLocaleString(), unit: 'kcal',     delta: `↑ ${s.active_calories_avg_per_day} avg/day`,        color: 'var(--color-wolf)' },
    { label: 'Resting Calories', val: s.resting_calories_total.toLocaleString(),unit: 'kcal BMR', delta: `~${s.resting_calories_avg_per_day}/day`,             color: 'var(--color-white)' },
    { label: 'Total Calories',   val: s.total_calories.toLocaleString(),        unit: 'kcal',     delta: 'active + resting',                                  color: 'var(--color-amber)' },
    { label: 'Exercise Time',    val: s.exercise_minutes_total.toString(),      unit: 'minutes',  delta: `${s.exercise_minutes_avg_per_day} avg/day`,          color: 'var(--color-wolf)' },
    { label: 'Avg Resting HR',   val: s.rhr_avg.toString(),                    unit: 'bpm avg',  delta: 'range 55–75',                                       color: 'var(--color-wolf)' },
    { label: 'Avg HRV',          val: s.hrv_avg_ms.toString(),                 unit: 'ms SDNN',  delta: 'peak 71 ms',                                        color: 'var(--color-wolf)' },
    { label: 'VO₂ Max',          val: s.vo2_max.toFixed(1),                    unit: 'mL/kg/min',delta: '↑ +14.7% since Feb',                               color: 'var(--color-wolf)' },
  ]

  return (
    <section>
      <SectionHeader label="Weekly Summary" meta="Apr 8–14" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)' }}>
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.04 }}
            style={{ background: 'var(--color-card)', padding: '24px 20px' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '10px' }}>{t.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '42px', lineHeight: 1, letterSpacing: '1px', color: t.color }}>{t.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)', marginTop: '6px' }}>{t.unit}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-wolf)', marginTop: '4px' }}>{t.delta}</div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
