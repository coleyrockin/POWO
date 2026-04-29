'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { HealthData } from '@/lib/types'
import { buildWorkoutRecommendation } from '@/lib/helpers'

interface Props { data: HealthData }

const INTENSITY_CHIP: Record<string, { bg: string; fg: string; label: string }> = {
  low:  { bg: '#0e2a14', fg: 'var(--accent-green)',   label: 'LOW'  },
  mod:  { bg: '#0d1f2a', fg: '#5fb0ff',                label: 'MOD'  },
  high: { bg: '#2a1a05', fg: 'var(--accent-amber)',   label: 'HIGH' },
}

export default function WorkoutRecommendation({ data }: Props) {
  const rec = buildWorkoutRecommendation(data)
  const totalIntensityCount = { low: 0, mod: 0, high: 0 }
  rec.days.forEach(d => d.blocks.forEach(b => totalIntensityCount[b.intensity]++))

  return (
    <section id="training">
      <SectionHeader label="Recommended Workout" meta={`${rec.days.length}-day cycle · ${rec.weekly_volume_min} min`} />

      {/* Headline card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ background: 'linear-gradient(180deg, #0a2018 0%, #050f0c 100%)', border: '1px solid #1a3a30', borderTop: 'none', padding: '18px 16px', boxShadow: 'inset 0 1px 0 rgba(0,212,170,0.18), 0 0 24px rgba(0,212,170,0.08)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-teal)', letterSpacing: '0.5px' }}>{rec.cycle_name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)' }}>{rec.start_date} → {rec.end_date}</div>
        </div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-white)', lineHeight: 1.55 }}>{rec.rationale}</div>

        {/* Mini stat strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '14px' }}>
          {[
            { l: 'Days',      v: rec.days.length },
            { l: 'Min/wk',    v: rec.weekly_volume_min },
            { l: 'Hi blocks', v: totalIntensityCount.high },
            { l: 'Z1/Z2 days',v: rec.days.filter(d => d.zone.includes('Z1') || d.zone.includes('Z2')).length },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 6px', borderRadius: '3px', textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-teal)', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', color: 'var(--color-mid)', textTransform: 'uppercase', marginTop: '3px' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Day cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {rec.days.map((day, i) => (
          <motion.div key={day.day}
            initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
            className="powo-lift"
            style={{ background: 'var(--color-card)', padding: '16px 14px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent-teal)', fontWeight: 700 }}>{day.day.toUpperCase()}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-dim)', margin: '0 6px' }}>·</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: 'var(--color-white)', letterSpacing: '0.5px' }}>{day.focus}</span>
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', letterSpacing: '0.08em' }}>{day.zone}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-white)', fontWeight: 600 }}>{day.duration_min} min</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '8px' }}>
              {day.blocks.map((b, j) => {
                const chip = INTENSITY_CHIP[b.intensity]
                return (
                  <div key={j} style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '8px', alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', fontWeight: 700, color: chip.fg, background: chip.bg, padding: '3px 4px', borderRadius: '2px', textAlign: 'center', flexShrink: 0, height: '18px' }}>{chip.label}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--color-white)' }}>{b.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '2px', lineHeight: 1.5 }}>{b.detail}</div>
                    </div>
                    {b.sets && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-teal)', fontWeight: 600, whiteSpace: 'nowrap' }}>{b.sets}</span>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', lineHeight: 1.5, paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
              <span style={{ color: 'var(--accent-teal)', opacity: 0.8 }}>WHY</span> · {day.rationale}
            </div>
            {day.cites && day.cites.length > 0 && (
              <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {day.cites.map(c => (
                  <span key={c} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.04em', padding: '2px 6px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.22)', color: 'var(--accent-teal)', borderRadius: '2px' }}>{c}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Guardrails */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent-coral)', textTransform: 'uppercase', marginBottom: '8px' }}>Guardrails</div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {rec.guardrails.map(g => (
            <li key={g} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-white)', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
              <span style={{ color: 'var(--accent-coral)', flexShrink: 0 }}>!</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
