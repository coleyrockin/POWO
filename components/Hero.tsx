'use client'
import { motion } from 'framer-motion'
import CountUp from './CountUp'
import { fmtShort } from '@/lib/helpers'
import type { HealthData } from '@/lib/types'

interface Props { data: HealthData }

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
})

export default function Hero({ data }: Props) {
  const t = data.summary.period_totals
  const v = data.summary.vo2_max_progression
  const a = data.summary.averages
  const since = ((v.peak.value - v.first.value) / v.first.value) * 100

  const kpis = [
    { node: <CountUp value={v.current.value} decimals={1} />, label: 'VO₂ MAX',  color: 'var(--accent-teal)'   },
    { node: <CountUp value={t.total_steps / 1000} decimals={0} suffix="K" />, label: 'STEPS', color: 'var(--accent-green)'  },
    { node: <CountUp value={t.total_active_kcal / 1000} decimals={1} suffix="K" />, label: 'KCAL', color: 'var(--accent-amber)'  },
    { node: <CountUp value={t.total_workouts} />,             label: 'WORKOUTS',  color: 'var(--accent-coral)'  },
    { node: <CountUp value={Math.round(t.total_distance_km)} suffix=" KM" />, label: 'DISTANCE', color: 'var(--accent-purple)' },
    { node: <CountUp value={t.total_exercise_min} />,         label: 'EX·MIN',  color: 'var(--accent-blue)'   },
  ]

  return (
    <header style={{
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid var(--color-border)',
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
          fontSize: 'clamp(110px, 31vw, 162px)',
          WebkitTextStroke: '1px rgba(240,237,230,0.055)', color: 'transparent', letterSpacing: '1px',
          opacity: 0.95,
          whiteSpace: 'nowrap',
          zIndex: 0,
        }}
        aria-hidden
      >
        POWO
      </div>

      <motion.div {...fadeUp(0.05)} className="powo-badge-glow" style={{
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
        Apple Health · 91-Day Snapshot
      </motion.div>

      <motion.h1 {...fadeUp(0.1)} style={{ fontFamily: 'var(--font-display)', lineHeight: 0.88, letterSpacing: '2px', fontSize: 'clamp(72px, 22vw, 106px)', marginBottom: '6px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <span className="powo-glow-blue" style={{ color: 'var(--accent-blue)' }}>PO</span><span className="powo-glow-white" style={{ color: 'var(--color-white)' }}>WO</span>
      </motion.h1>

      <motion.div {...fadeUp(0.15)} style={{
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
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '6px',
        background: 'rgba(8,8,9,0.42)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.035)',
        overflow: 'hidden',
      }}>
        <span style={{ padding: '8px 10px', color: 'var(--color-white)', fontWeight: 600 }}>{data.meta.owner.toUpperCase()}</span>
        <span aria-hidden style={{ alignSelf: 'stretch', width: '1px', background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ padding: '8px 10px', color: 'var(--color-mid)', whiteSpace: 'nowrap' }}>{fmtShort(data.meta.period.start)} – {fmtShort(data.meta.period.end)}, 2026</span>
        <span aria-hidden style={{ alignSelf: 'stretch', width: '1px', background: 'rgba(255,255,255,0.07)' }} />
        <span style={{ display: 'inline-block', color: 'var(--accent-blue)', padding: '8px 10px', letterSpacing: '0.12em', fontSize: '10px', fontWeight: 700, background: 'rgba(10,132,255,0.09)' }}>
          {data.meta.period.days} DAYS
        </span>
      </motion.div>

      {/* Profile strip */}
      <motion.div {...fadeUp(0.2)} style={{
        width: '100%',
        marginTop: '18px',
        padding: '0',
        border: '1px solid var(--color-border)',
        background: 'linear-gradient(180deg, rgba(24,24,27,0.72), rgba(13,13,15,0.94))',
        borderRadius: '6px',
        boxShadow: 'var(--shadow-card)',
        position: 'relative',
        zIndex: 1,
        overflow: 'hidden',
      }}>
        <div aria-hidden style={{ height: '2px', background: 'linear-gradient(90deg, var(--accent-blue), rgba(0,212,170,0.42), rgba(255,170,34,0.18))' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <div style={{ minHeight: '66px', padding: '13px 14px 12px', borderRight: '1px solid rgba(255,255,255,0.055)', borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.17em', color: 'var(--accent-blue)', textTransform: 'uppercase', marginBottom: '6px' }}>Goal</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.primary_goal}</div>
          </div>
          <div style={{ minHeight: '66px', padding: '13px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.055)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.17em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '6px' }}>Weight</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.weight_lbs} lb <span style={{ color: 'var(--color-dim)', fontWeight: 500 }}>·</span> {data.profile.weight_kg} kg</div>
          </div>
          <div style={{ minHeight: '76px', padding: '13px 14px 12px', borderRight: '1px solid rgba(255,255,255,0.055)' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.17em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '6px' }}>Focus</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.training_focus}</div>
          </div>
          <div style={{ minHeight: '76px', padding: '13px 14px 12px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.17em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '6px' }}>Lifestyle</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.35, fontWeight: 600, color: 'var(--color-white)' }}>{data.profile.active_lifestyle.join(' · ')}</div>
          </div>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div style={{ width: '100%', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
          {kpis.map((k, i) => (
            <motion.div key={k.label} {...fadeUp(0.22 + i * 0.05)} style={{ minHeight: '80px', padding: '14px 4px 12px', background: 'linear-gradient(180deg, rgba(24,24,27,0.7), rgba(13,13,15,0.96))', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', textAlign: 'center' }}>
              <span className={
                k.color === 'var(--accent-blue)'   ? 'powo-glow-blue'   :
                k.color === 'var(--accent-green)'  ? 'powo-glow-green'  :
                k.color === 'var(--accent-amber)'  ? 'powo-glow-amber'  :
                k.color === 'var(--accent-coral)'  ? 'powo-glow-coral'  :
                k.color === 'var(--accent-purple)' ? 'powo-glow-purple' :
                k.color === 'var(--accent-teal)'   ? 'powo-glow-teal'   : ''
              } style={{ fontFamily: 'var(--font-display)', fontSize: '31px', lineHeight: 1, color: k.color }}>{k.node}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)' }}>{k.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Headline insight */}
      <motion.div {...fadeUp(0.55)} style={{
        width: '100%', marginTop: '24px', padding: '15px 15px 14px',
        border: '1px solid #1f2a24', background: 'linear-gradient(180deg, #0f1815 0%, #080f0d 100%)',
        boxShadow: 'inset 0 1px 0 rgba(0,212,170,0.10), 0 0 24px rgba(0,212,170,0.06)',
        borderRadius: '6px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '6px' }}>Headline</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.55, color: 'var(--color-white)' }}>
          VO₂ max climbed from <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{v.first.value.toFixed(1)}</span> to a peak of <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{v.peak.value.toFixed(2)}</span> on {fmtShort(v.peak.date)} — <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>+{since.toFixed(1)}%</span> in 8 weeks. Daily averages: <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{a.avg_daily_steps.toLocaleString()} steps</span> · <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{Math.round(a.avg_active_kcal)} kcal</span> · <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{Math.round(a.avg_exercise_min)} exercise min</span>.
        </div>
      </motion.div>
    </header>
  )
}
