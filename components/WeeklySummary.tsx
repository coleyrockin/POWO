'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { HealthData } from '@/lib/types'
import { buildWeeklyAggregates } from '@/lib/helpers'

interface Props { data: HealthData }

export default function WeeklySummary({ data }: Props) {
  const t = data.summary.period_totals
  const a = data.summary.averages
  const b = data.summary.best_days
  const v = data.summary.vo2_max_progression
  const since = ((v.peak.value - v.first.value) / v.first.value) * 100
  const esbCount = (t.total_flights_climbed / 102).toFixed(1)
  const totalMi = (t.total_distance_km * 0.621371).toFixed(0)

  const tiles = [
    { label: 'Total Steps',      val: t.total_steps.toLocaleString(),                    unit: '91 days',                      delta: `↑ ${a.avg_daily_steps.toLocaleString()} avg/day`,                                                  color: 'var(--accent-green)'  },
    { label: 'Active Calories',  val: Math.round(t.total_active_kcal).toLocaleString(),  unit: 'kcal active',                  delta: `↑ ${Math.round(a.avg_active_kcal)} avg/day`,                                                       color: 'var(--accent-amber)'  },
    { label: 'Distance',         val: t.total_distance_km.toFixed(1),                    unit: `km · ${totalMi} mi`,           delta: `${(t.total_distance_km / data.meta.period.days).toFixed(1)} km/day · ≈ LA → SF`,                  color: 'var(--accent-purple)' },
    { label: 'Exercise Time',    val: t.total_exercise_min.toLocaleString(),             unit: 'minutes',                      delta: `${Math.round(a.avg_exercise_min)} min/day · 100 hrs total`,                                         color: 'var(--accent-blue)'   },
    { label: 'Workouts Logged',  val: t.total_workouts.toString(),                       unit: 'sessions',                     delta: '11 activity types',                                                                                 color: 'var(--accent-coral)'  },
    { label: 'Flights Climbed',  val: t.total_flights_climbed.toLocaleString(),          unit: 'floors',                       delta: `≈ ${esbCount}× Empire State`,                                                                       color: 'var(--accent-purple)' },
    { label: 'VO₂ Max',          val: v.current.value.toFixed(2),                        unit: 'mL/kg/min · current',          delta: `peak ${v.peak.value.toFixed(2)} · +${since.toFixed(1)}% since Feb`,                                color: 'var(--accent-teal)'   },
    { label: 'Avg Resting HR',   val: a.avg_resting_hr.toFixed(1),                       unit: 'bpm',                          delta: 'period baseline',                                                                                  color: 'var(--accent-coral)'  },
    { label: 'Avg HRV',          val: a.avg_hrv_ms.toFixed(1),                           unit: 'ms SDNN',                      delta: 'period baseline',                                                                                  color: 'var(--accent-green)'  },
    { label: 'Best Day · Steps', val: b.max_steps.value.toLocaleString(),                unit: new Date(b.max_steps.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), delta: '2.4× daily average',     color: 'var(--accent-amber)'  },
    { label: 'Best · Burn',      val: Math.round(b.max_active_kcal.value).toLocaleString(), unit: new Date(b.max_active_kcal.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), delta: '3.1× daily average', color: 'var(--accent-coral)' },
    { label: 'Best · Move',      val: b.max_exercise_min.value.toString(),               unit: `min · ${new Date(b.max_exercise_min.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,             delta: '4.4 hrs of exercise',     color: 'var(--accent-purple)' },
  ]

  // Weekly aggregates — bucketed Mon-Sun; pick best & worst by exercise minutes
  const weekly = buildWeeklyAggregates(data).filter(w => w.daysCovered >= 5)
  const bestWeek = weekly.reduce((a, b) => (b.activeKcal > a.activeKcal ? b : a))
  const worstWeek = weekly.reduce((a, b) => (b.activeKcal < a.activeKcal ? b : a))
  const fmtRange = (s: string, e: string) =>
    `${new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(e + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`

  return (
    <section id="period">
      <SectionHeader label="Period Summary" meta="91 days · Q1 2026" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignItems: 'stretch', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.03 }}
            className="powo-lift"
            style={{ background: 'var(--color-card)', padding: '16px 14px', minHeight: '126px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-white)', marginBottom: '6px' }}>{t.label}</div>
            <div className={
              t.color === 'var(--accent-blue)'   ? 'powo-glow-blue'   :
              t.color === 'var(--accent-green)'  ? 'powo-glow-green'  :
              t.color === 'var(--accent-amber)'  ? 'powo-glow-amber'  :
              t.color === 'var(--accent-coral)'  ? 'powo-glow-coral'  :
              t.color === 'var(--accent-purple)' ? 'powo-glow-purple' :
              t.color === 'var(--accent-teal)'   ? 'powo-glow-teal'   : ''
            } style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1, letterSpacing: '0.5px', color: t.color }}>{t.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '4px' }}>{t.unit}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 500, color: t.color, marginTop: '2px' }}>{t.delta}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly breakdown */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent-blue-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>Monthly Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 1fr 1fr 1fr', gap: '10px 8px', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px', lineHeight: 1.45 }}>
          <div style={{ color: 'var(--color-mid)', fontSize: '10px', letterSpacing: '0.12em' }}>MO</div>
          <div style={{ color: 'var(--color-mid)', fontSize: '10px', letterSpacing: '0.12em' }}>STEPS</div>
          <div style={{ color: 'var(--color-mid)', fontSize: '10px', letterSpacing: '0.12em' }}>KCAL</div>
          <div style={{ color: 'var(--color-mid)', fontSize: '10px', letterSpacing: '0.12em' }}>EX·MIN</div>
          <div style={{ color: 'var(--color-mid)', fontSize: '10px', letterSpacing: '0.12em' }}>RHR/HRV</div>
          {Object.entries(data.monthly).map(([month, m]) => {
            const label = month.slice(-2) === '02' ? 'FEB' : month.slice(-2) === '03' ? 'MAR' : 'APR'
            return (
              <div key={month} style={{ display: 'contents' }}>
                <div style={{ color: 'var(--color-white)', fontWeight: 600, letterSpacing: '0.08em' }}>{label}</div>
                <div style={{ color: 'var(--color-white)' }}>{m.total_steps.toLocaleString()}<span style={{ color: 'var(--color-mid)', fontSize: '10px' }}> · {m.avg_steps.toLocaleString()}/d</span></div>
                <div style={{ color: 'var(--color-white)' }}>{Math.round(m.total_active_kcal).toLocaleString()}<span style={{ color: 'var(--color-mid)', fontSize: '10px' }}> · {Math.round(m.avg_active_kcal)}/d</span></div>
                <div style={{ color: 'var(--color-white)' }}>{m.total_exercise_min.toLocaleString()}</div>
                <div style={{ color: 'var(--color-white)' }}>{m.avg_resting_hr.toFixed(1)}<span style={{ color: 'var(--color-mid)' }}> / </span>{m.avg_hrv.toFixed(1)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly aggregates */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent-blue-dim)', textTransform: 'uppercase', marginBottom: '10px' }}>Weekly Heatmap · Active kcal</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {weekly.map((w, i) => {
            const max = Math.max(...weekly.map(x => x.activeKcal))
            const pct = (w.activeKcal / max) * 100
            const isBest = w.weekStart === bestWeek.weekStart
            const isWorst = w.weekStart === worstWeek.weekStart
            const color = isBest ? 'var(--accent-amber)' : isWorst ? 'var(--accent-coral)' : '#5a6470'
            return (
              <motion.div key={w.weekStart}
                initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.025 }}
                style={{ display: 'grid', gridTemplateColumns: '92px 1fr 64px', gap: '6px', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
              >
                <span style={{ color: isBest || isWorst ? color : 'var(--color-mid)', fontWeight: isBest || isWorst ? 600 : 400 }}>{fmtRange(w.weekStart, w.weekEnd)}</span>
                <div style={{ height: '6px', borderRadius: '3px', background: '#0a0a0a', overflow: 'hidden', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.4)' }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.025, ease: [0.16, 1, 0.3, 1] }}
                    style={{ height: '6px', borderRadius: '3px', background: `linear-gradient(180deg, color-mix(in srgb, ${color} 100%, white 18%), ${color})`, boxShadow: `0 0 6px color-mix(in srgb, ${color} 50%, transparent)` }} />
                </div>
                <span style={{ color: isBest || isWorst ? color : 'var(--color-white)', textAlign: 'right', fontWeight: 600 }}>{Math.round(w.activeKcal).toLocaleString()}</span>
              </motion.div>
            )
          })}
        </div>
        <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)' }}>
          <span style={{ color: 'var(--accent-amber)' }}>● Peak week</span>
          <span style={{ color: 'var(--accent-coral)' }}>● Deload week</span>
        </div>
      </div>
    </section>
  )
}
