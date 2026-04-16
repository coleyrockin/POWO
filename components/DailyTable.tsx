'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { DailyMetric } from '@/lib/types'

interface Props { daily: DailyMetric[] }

const DAY_LABELS = ['Tue Apr 8','Wed Apr 9','Thu Apr 10','Fri Apr 11','Sat Apr 12','Sun Apr 13','Mon Apr 14']
const COL_HEADERS = ['Day','Steps','','Active Cal','Ex Min','RHR','HRV','Avg HR','Walk HR','Resp','Temp']

export default function DailyTable({ daily }: Props) {
  const maxSteps = Math.max(...daily.map(d => d.steps))

  return (
    <section>
      <SectionHeader label="Daily Breakdown" meta="7 days" />
      <div style={{ overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none', border: '1px solid var(--color-border)', borderTop: 'none' }} className="no-scrollbar">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
          <thead>
            <tr>
              {COL_HEADERS.map((h, i) => (
                <th key={i} style={{
                  background: 'var(--color-card)', fontFamily: 'var(--font-mono)', fontSize: '9px',
                  letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mid)',
                  borderBottom: '1px solid var(--color-border)', padding: '12px 12px',
                  textAlign: i === 0 ? 'left' : 'right', whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {daily.map((d, i) => {
              const best = d.steps === maxSteps
              const pct = Math.round((d.steps / maxSteps) * 100)
              return (
                <motion.tr
                  key={d.date}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  style={{ background: '#0a0a0a', borderBottom: '1px solid #161616', color: best ? 'var(--color-wolf)' : 'var(--color-white)' }}
                >
                  <td style={{ padding: '11px 12px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '13px', whiteSpace: 'nowrap' }}>{DAY_LABELS[i]}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: '16px' }}>{d.steps.toLocaleString()}</td>
                  <td style={{ padding: '11px 12px', minWidth: '80px' }}>
                    <div style={{ height: '3px', borderRadius: '2px', background: 'var(--color-dim)', overflow: 'hidden' }}>
                      <div style={{ height: '3px', borderRadius: '2px', background: 'var(--color-wolf)', width: `${pct}%` }} />
                    </div>
                  </td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{d.active_calories.toLocaleString()}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{d.exercise_minutes}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', color: d.resting_heart_rate <= 60 ? 'var(--color-wolf)' : undefined }}>{d.resting_heart_rate}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', color: d.hrv_ms >= 60 ? 'var(--color-wolf)' : undefined }}>{Math.round(d.hrv_ms)}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{Math.round(d.avg_heart_rate)}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{Math.round(d.walking_heart_rate)}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{d.respiratory_rate.toFixed(1)}</td>
                  <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-mid)' }}>{d.wrist_temp_c ? d.wrist_temp_c.toFixed(2) + '°' : '—'}</td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
