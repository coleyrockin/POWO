'use client'
import { useMemo } from 'react'
import { m } from 'framer-motion'
import CountUp from './CountUp'
import Sparkline from './Sparkline'
import { fmtShort, glowClassForAccent } from '@/lib/helpers'
import type { HealthData } from '@/lib/types'

interface Props { data: HealthData }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

function rolling(values: number[], window: number): number[] {
  if (values.length === 0) return []
  const out: number[] = []
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1)
    const slice = values.slice(start, i + 1)
    out.push(slice.reduce((a, b) => a + b, 0) / slice.length)
  }
  return out
}

export default function Hero({ data }: Props) {
  const t = data.summary.period_totals
  const v = data.summary.vo2_max_progression
  const a = data.summary.averages
  const since = v.first.value > 0 ? ((v.peak.value - v.first.value) / v.first.value) * 100 : 0
  const vo2Weeks = Math.max(1, Math.round((new Date(`${v.peak.date}T00:00:00`).getTime() - new Date(`${v.first.date}T00:00:00`).getTime()) / (7 * 86_400_000)))

  // Dec–Jan "ramp" → spring resting-HR story (only surfaces on a clear drop).
  const rhrCut = new Date(`${data.meta.period.start}T00:00:00`)
  rhrCut.setDate(rhrCut.getDate() + 60)
  const rhrCutISO = rhrCut.toISOString().slice(0, 10)
  const meanOf = (xs: number[]) => (xs.length ? xs.reduce((p, q) => p + q, 0) / xs.length : null)
  const rhrEarly = meanOf(data.daily.filter(d => d.date < rhrCutISO && d.resting_hr != null).map(d => d.resting_hr as number))
  const rhrLate = meanOf(data.daily.filter(d => d.date >= rhrCutISO && d.resting_hr != null).map(d => d.resting_hr as number))
  const rhrStory = rhrEarly != null && rhrLate != null && rhrEarly - rhrLate >= 3

  // Sparkline series — smoothed where the raw signal is jagged. Memoized: the
  // rolling() passes walk the full dataset ×6 and the data prop is static.
  const { stepsSeries, kcalSeries, distSeries, exMinSeries, vo2Series, workoutSeries } = useMemo(() => {
    const workoutByDay = new Map<string, number>()
    for (const w of data.workouts) workoutByDay.set(w.date, (workoutByDay.get(w.date) ?? 0) + 1)
    return {
      stepsSeries:   rolling(data.daily.map(d => d.steps), 5),
      kcalSeries:    rolling(data.daily.map(d => d.active_kcal ?? 0), 5),
      distSeries:    rolling(data.daily.map(d => d.distance_m / 1000), 5),
      exMinSeries:   rolling(data.daily.map(d => d.exercise_min ?? 0), 5),
      vo2Series:     data.vo2_max.map(p => p.value),
      workoutSeries: rolling(data.daily.map(d => workoutByDay.get(d.date) ?? 0), 7),
    }
  }, [data.daily, data.workouts, data.vo2_max])

  const kpis = [
    { node: <CountUp value={v.current.value} decimals={1} />,                 label: 'VO₂ MAX',  color: 'var(--accent-teal)',   spark: vo2Series },
    { node: <CountUp value={t.total_steps / 1000} decimals={0} suffix="K" />, label: 'STEPS',    color: 'var(--accent-green)',  spark: stepsSeries },
    { node: <CountUp value={t.total_active_kcal / 1000} decimals={1} suffix="K" />, label: 'KCAL', color: 'var(--accent-amber)', spark: kcalSeries },
    { node: <CountUp value={t.total_workouts} />,                              label: 'WORKOUTS', color: 'var(--accent-coral)',  spark: workoutSeries },
    { node: <CountUp value={Math.round(t.total_distance_km)} suffix=" KM" />, label: 'DISTANCE', color: 'var(--accent-purple)', spark: distSeries },
    { node: <CountUp value={t.total_exercise_min} />,                          label: 'EX·MIN',   color: 'var(--accent-blue)',   spark: exMinSeries },
  ]

  return (
    <header className="powo-hero" style={{
      position: 'relative',
      overflow: 'hidden',
      padding: '46px 24px 36px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background:
        'linear-gradient(180deg, rgba(10,132,255,0.09) 0%, rgba(8,8,8,0) 42%), linear-gradient(90deg, rgba(10,132,255,0.08), transparent 32%, transparent 68%, rgba(255,170,34,0.055))',
    }}>
      <div
        style={{
          position: 'absolute', left: '50%', top: '10px',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-display)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          WebkitTextStroke: '1px rgba(240,237,230,0.055)', color: 'transparent', letterSpacing: '1px',
          opacity: 0.95,
          whiteSpace: 'nowrap',
          zIndex: 0,
        }}
        className="powo-hero-ghost"
        aria-hidden
      >
        POWO
      </div>

      <m.div {...fadeUp(0.05)} className="powo-badge-glow" style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        background: 'linear-gradient(180deg, #3ddb6a 0%, #2bb04c 100%)', color: 'var(--color-black)',
        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600,
        letterSpacing: '0.14em', textTransform: 'uppercase',
        padding: '5px 12px', marginBottom: '18px', borderRadius: '4px', position: 'relative', zIndex: 1,
      }}>
        <span aria-hidden style={{ position: 'relative', width: '7px', height: '7px', display: 'inline-block' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-black)', animation: 'powo-pulse 2s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-black)' }} />
        </span>
        Apple Health · {data.meta.period.days}-Day Snapshot
      </m.div>

      <m.h1 {...fadeUp(0.1)} className="powo-wordmark powo-hero-title" style={{ fontFamily: 'var(--font-display)', lineHeight: 0.88, letterSpacing: '2px', marginBottom: '6px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        POWO
      </m.h1>

      <m.div {...fadeUp(0.15)} style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'var(--color-white)',
        letterSpacing: '0.09em',
        marginTop: '18px',
        display: 'inline-flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '0',
        lineHeight: 1,
        position: 'relative',
        zIndex: 1,
        borderRadius: '6px',
        background: 'var(--color-panel)',
        boxShadow: 'inset 0 1px 0 var(--hairline)',
        overflow: 'hidden',
      }}>
        <span style={{ padding: '8px 10px', color: 'var(--color-white)', fontWeight: 600 }}>{data.meta.owner.toUpperCase()}</span>
        <span aria-hidden style={{ alignSelf: 'stretch', width: '1px', background: 'var(--hairline)' }} />
        <span style={{ padding: '8px 10px', color: 'var(--color-mid)', whiteSpace: 'nowrap' }}>{fmtShort(data.meta.period.start)} – {fmtShort(data.meta.period.end)}, {data.meta.period.start.slice(0, 4) === data.meta.period.end.slice(0, 4) ? data.meta.period.end.slice(0, 4) : `${data.meta.period.start.slice(0, 4)}–${data.meta.period.end.slice(0, 4)}`}</span>
        <span aria-hidden style={{ alignSelf: 'stretch', width: '1px', background: 'var(--hairline)' }} />
        <span style={{ display: 'inline-block', color: 'var(--accent-blue)', padding: '8px 10px', letterSpacing: '0.12em', fontSize: '10px', fontWeight: 700, background: 'rgba(10,132,255,0.09)' }}>
          {data.meta.period.days} DAYS
        </span>
      </m.div>

      {/* Profile strip */}
      <m.div {...fadeUp(0.2)} style={{
        width: '100%',
        marginTop: '18px',
        padding: '0',
        background: 'var(--color-panel)',
        borderRadius: '6px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{ height: '2px', background: 'linear-gradient(90deg, var(--accent-blue), rgba(0,212,170,0.42), rgba(255,170,34,0.18))' }} />
        <div className="powo-grid-profile" style={{ display: 'grid' }}>
          <div style={{ minHeight: '66px', padding: '13px 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>Goal</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.primary_goal}</div>
          </div>
          <div style={{ minHeight: '66px', padding: '13px 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '6px' }}>Weight</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.weight_lbs} lb <span style={{ color: 'var(--color-dim)', fontWeight: 500 }}>·</span> {data.profile.weight_kg} kg</div>
          </div>
          <div style={{ minHeight: '76px', padding: '13px 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '6px' }}>Focus</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.training_focus}</div>
          </div>
          <div style={{ minHeight: '76px', padding: '13px 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '6px' }}>Lifestyle</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.active_lifestyle.join(' · ')}</div>
          </div>
        </div>
      </m.div>

      {/* KPI grid — stat trophies */}
      <div style={{ width: '100%', marginTop: '16px', paddingTop: '16px', position: 'relative', zIndex: 1 }}>
        <div className="powo-grid-kpi" style={{ display: 'grid', gap: '6px' }}>
          {kpis.map((k, i) => (
            <m.div
              key={k.label}
              {...fadeUp(0.22 + i * 0.05)}
              className="powo-trophy"
              style={{
                ['--trophy-color' as string]: k.color,
                borderRadius: '8px',
                minHeight: '104px',
                padding: '12px 6px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '4px',
                textAlign: 'center',
                isolation: 'isolate',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)', position: 'relative', zIndex: 2 }}>{k.label}</span>
              <span
                className={glowClassForAccent(k.color)}
                style={{ fontFamily: 'var(--font-display)', fontSize: '32px', lineHeight: 1, color: k.color, position: 'relative', zIndex: 2 }}
              >
                {k.node}
              </span>
              <div className="powo-kpi-spark" style={{ height: '18px', position: 'relative', zIndex: 2 }}>
                <Sparkline values={k.spark} color={k.color} delay={0.35 + i * 0.06} />
              </div>
            </m.div>
          ))}
        </div>
      </div>

      {/* Headline insight */}
      <m.div {...fadeUp(0.55)} style={{
        width: '100%', marginTop: '24px', padding: '15px 15px 14px',
        background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent-teal) 10%, var(--color-card)), color-mix(in srgb, var(--accent-teal) 4%, var(--color-card)))',
        boxShadow: 'inset 0 1px 0 rgba(0,212,170,0.10), 0 0 24px rgba(0,212,170,0.06)',
        borderRadius: '6px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '6px' }}>Headline</div>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: '15.5px', lineHeight: 1.6, letterSpacing: '0.005em', color: 'var(--color-white)', maxWidth: '72ch' }}>
          VO₂ max climbed from <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{v.first.value.toFixed(1)}</span> to a peak of <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{v.peak.value.toFixed(2)}</span> on {fmtShort(v.peak.date)} — <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>+{since.toFixed(1)}%</span> in {vo2Weeks} weeks. Daily averages: <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{a.avg_daily_steps.toLocaleString()} steps</span> · <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{Math.round(a.avg_active_kcal)} kcal</span> · <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{Math.round(a.avg_exercise_min)} exercise min</span>.{rhrStory && (<> Resting HR eased from a <span style={{ color: 'var(--accent-coral)', fontWeight: 600 }}>{Math.round(rhrEarly as number)}</span>-bpm winter baseline to <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{Math.round(rhrLate as number)}</span>.</>)}
        </div>
      </m.div>
    </header>
  )
}
