'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { DailyMetric, Workout } from '@/lib/types'

interface Props { daily: DailyMetric[]; workouts: Workout[] }

const COL_HEADERS: { text: string; srOnly: boolean }[] = [
  { text: 'Day',         srOnly: true  },
  { text: 'Steps',       srOnly: false },
  { text: 'Steps trend', srOnly: true  },
  { text: 'Cal',         srOnly: false },
  { text: 'Min',         srOnly: false },
  { text: 'RHR',         srOnly: false },
  { text: 'HRV',         srOnly: false },
]

const srOnly: React.CSSProperties = {
  position: 'absolute', width: '1px', height: '1px', padding: 0,
  margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap', border: 0,
}

function fmtDay(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  const wd = d.toLocaleDateString('en-US', { weekday: 'short' })
  const dd = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${wd} ${dd.split(' ')[1]}`
}

export default function DailyTable({ daily, workouts }: Props) {
  const last14 = daily.slice(-14)
  const maxSteps = Math.max(...last14.map(d => d.steps))
  const maxCal = Math.max(...last14.map(d => d.active_kcal ?? 0))

  const workoutCountByDate: Record<string, number> = {}
  for (const w of workouts) {
    workoutCountByDate[w.date] = (workoutCountByDate[w.date] ?? 0) + 1
  }

  return (
    <section>
      <SectionHeader label="Daily Breakdown" meta="last 14 days" />
      <div style={{ overflowX: 'auto', msOverflowStyle: 'none', scrollbarWidth: 'none', border: '1px solid var(--color-border)', borderTop: 'none' }} className="no-scrollbar">
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <caption style={srOnly}>Daily fitness breakdown, last 14 days</caption>
          <thead>
            <tr>
              {COL_HEADERS.map((h, i) => (
                <th key={i} scope="col" style={{
                  background: 'var(--color-card)', fontFamily: 'var(--font-mono)', fontSize: '10px',
                  letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-white)',
                  borderBottom: '1px solid var(--color-border)', padding: '12px 4px', height: '40px',
                  textAlign: i === 0 ? 'left' : 'right', whiteSpace: 'nowrap',
                  ...(i === 0 ? { paddingLeft: '10px' } : {}),
                }}>
                  {h.srOnly ? <span style={srOnly}>{h.text}</span> : h.text}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {last14.map((d, i) => {
              const cal = d.active_kcal ?? 0
              const stepsLeader = d.steps === maxSteps
              const calLeader = cal === maxCal && cal > 0
              const pct = Math.round((d.steps / maxSteps) * 100)
              const workoutCount = workoutCountByDate[d.date] ?? 0
              return (
                <motion.tr
                  key={d.date}
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                  style={{ background: '#0a0a0a', borderBottom: '1px solid rgba(255,255,255,0.055)', height: '44px' }}
                >
                  <td style={{ padding: '11px 4px 11px 10px', textAlign: 'left', fontFamily: 'var(--font-sans)', fontWeight: 500, fontSize: '12px', whiteSpace: 'nowrap', color: calLeader ? 'var(--accent-amber)' : stepsLeader ? 'var(--accent-green)' : 'var(--color-white)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      {fmtDay(d.date)}
                      {workoutCount > 0 && (
                        <span aria-label={`${workoutCount} workouts`} title={`${workoutCount} workouts`} style={{ display: 'inline-flex', gap: '2px' }}>
                          {Array.from({ length: Math.min(workoutCount, 5) }).map((_, j) => (
                            <span key={j} style={{ width: '3px', height: '3px', borderRadius: '50%', background: calLeader ? 'var(--accent-amber)' : 'var(--accent-green)', opacity: 0.9 }} />
                          ))}
                        </span>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: '11px 4px', textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: '15px', color: stepsLeader ? 'var(--accent-green)' : 'var(--color-white)' }}>{d.steps.toLocaleString()}</td>
                  <td style={{ padding: '11px 4px', minWidth: '40px' }}>
                    <div style={{ height: '5px', borderRadius: '3px', background: '#0a0a0a', overflow: 'visible', position: 'relative', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.5)' }}>
                      <div
                        className="powo-comet"
                        style={{
                          ['--bar-color' as string]: stepsLeader ? 'var(--accent-amber)' : 'var(--accent-green)',
                          height: '5px',
                          borderRadius: '3px',
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '11px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', color: calLeader ? 'var(--accent-amber)' : 'var(--color-white)', fontWeight: calLeader ? 600 : 500 }}>{Math.round(cal).toLocaleString()}</td>
                  <td style={{ padding: '11px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, color: 'var(--color-white)' }}>{d.exercise_min ?? '—'}</td>
                  <td style={{ padding: '11px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, color: d.resting_hr !== null && d.resting_hr <= 60 ? 'var(--accent-green)' : d.resting_hr !== null && d.resting_hr >= 70 ? 'var(--accent-coral)' : 'var(--color-white)' }}>{d.resting_hr ?? '—'}</td>
                  <td style={{ padding: '11px 10px 11px 4px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 500, color: d.hrv_ms !== null && d.hrv_ms >= 60 ? 'var(--accent-green)' : 'var(--color-white)' }}>{d.hrv_ms !== null ? Math.round(d.hrv_ms) : '—'}</td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
