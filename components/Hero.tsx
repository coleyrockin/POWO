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
    <header style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--color-border)', padding: '52px 24px 36px' }}>
      <div aria-hidden style={{ position: 'absolute', top: '-80px', left: '-60px', width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(36,139,245,0.18), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '-60px', right: '-40px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,170,34,0.10), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', top: '40%', right: '20%', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(179,102,255,0.08), transparent 70%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      <div
        style={{
          position: 'absolute', right: '-16px', top: '-8px',
          fontFamily: 'var(--font-display)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
          fontSize: 'clamp(96px, 30vw, 220px)',
          WebkitTextStroke: '1px #1a1a1a', color: 'transparent', letterSpacing: '-4px',
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
        padding: '5px 12px', marginBottom: '20px', borderRadius: '2px', position: 'relative',
      }}>
        <span aria-hidden style={{ position: 'relative', width: '7px', height: '7px', display: 'inline-block' }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-black)', animation: 'powo-pulse 2s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--color-black)' }} />
        </span>
        Apple Health · 91-Day Snapshot
      </motion.div>

      <motion.h1 {...fadeUp(0.1)} style={{ fontFamily: 'var(--font-display)', lineHeight: 0.88, letterSpacing: '2px', fontSize: 'clamp(56px, 18vw, 120px)', marginBottom: '6px' }}>
        <span className="powo-glow-blue" style={{ color: 'var(--accent-blue)' }}>PO</span><span className="powo-glow-white" style={{ color: 'var(--color-white)' }}>WO</span>
      </motion.h1>

      <motion.div {...fadeUp(0.15)} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-white)', letterSpacing: '0.04em', marginTop: '16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
        <span>{data.meta.owner.toUpperCase()}</span>
        <span style={{ color: 'var(--color-dim)' }}>·</span>
        <span style={{ color: 'var(--color-mid)' }}>{fmtShort(data.meta.period.start)} – {fmtShort(data.meta.period.end)}, 2026</span>
        <span style={{ color: 'var(--color-dim)' }}>·</span>
        <span style={{ display: 'inline-block', border: '1px solid var(--accent-blue)', color: 'var(--accent-blue)', padding: '2px 7px', letterSpacing: '0.12em', fontSize: '11px', fontWeight: 600 }}>
          {data.meta.period.days} DAYS
        </span>
      </motion.div>

      {/* Profile strip */}
      <motion.div {...fadeUp(0.2)} style={{ marginTop: '20px', padding: '12px 14px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '3px' }}>Goal</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--color-white)' }}>{data.profile.primary_goal}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '3px' }}>Weight</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--color-white)' }}>{data.profile.weight_lbs} lb · {data.profile.weight_kg} kg</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '3px' }}>Focus</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--color-white)' }}>{data.profile.training_focus}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '3px' }}>Lifestyle</div>
            <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--color-white)' }}>{data.profile.active_lifestyle.join(' · ')}</div>
          </div>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px 0' }}>
          {kpis.map((k, i) => (
            <motion.div key={k.label} {...fadeUp(0.22 + i * 0.05)} style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center' }}>
              <span className={
                k.color === 'var(--accent-blue)'   ? 'powo-glow-blue'   :
                k.color === 'var(--accent-green)'  ? 'powo-glow-green'  :
                k.color === 'var(--accent-amber)'  ? 'powo-glow-amber'  :
                k.color === 'var(--accent-coral)'  ? 'powo-glow-coral'  :
                k.color === 'var(--accent-purple)' ? 'powo-glow-purple' :
                k.color === 'var(--accent-teal)'   ? 'powo-glow-teal'   : ''
              } style={{ fontFamily: 'var(--font-display)', fontSize: '32px', lineHeight: 1, color: k.color }}>{k.node}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-white)' }}>{k.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Headline insight */}
      <motion.div {...fadeUp(0.55)} style={{
        marginTop: '24px', padding: '14px 14px 12px',
        border: '1px solid #1f2a24', background: 'linear-gradient(180deg, #0f1815 0%, #080f0d 100%)',
        boxShadow: 'inset 0 1px 0 rgba(0,212,170,0.10), 0 0 24px rgba(0,212,170,0.06)',
        borderRadius: '4px',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '6px' }}>Headline</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.55, color: 'var(--color-white)' }}>
          VO₂ max climbed from <span style={{ color: 'var(--accent-teal)', fontWeight: 600 }}>{v.first.value.toFixed(1)}</span> to a peak of <span style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>{v.peak.value.toFixed(2)}</span> on {fmtShort(v.peak.date)} — <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>+{since.toFixed(1)}%</span> in 8 weeks. Daily averages: <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{a.avg_daily_steps.toLocaleString()} steps</span> · <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{Math.round(a.avg_active_kcal)} kcal</span> · <span style={{ color: 'var(--color-white)', fontWeight: 600 }}>{Math.round(a.avg_exercise_min)} exercise min</span>.
        </div>
      </motion.div>
    </header>
  )
}
