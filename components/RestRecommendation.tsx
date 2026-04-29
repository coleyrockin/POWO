'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { HealthData } from '@/lib/types'
import { analyzeRecovery, analyzeSleep, buildRestRecommendation } from '@/lib/helpers'

interface Props { data: HealthData }

const STATUS_THEME: Record<string, { bg: string; border: string; accent: string; chip: string; chipText: string; label: string }> = {
  recover:  { bg: 'linear-gradient(180deg, #2a0a14 0%, #170509 100%)', border: '#5c1a2a', accent: 'var(--accent-coral)',  chip: 'var(--accent-coral)',  chipText: 'var(--color-black)', label: 'PULL BACK' },
  taper:    { bg: 'linear-gradient(180deg, #2a1a05 0%, #170d02 100%)', border: '#5c4214', accent: 'var(--accent-amber)',  chip: 'var(--accent-amber)',  chipText: 'var(--color-black)', label: 'TAPER' },
  maintain: { bg: 'linear-gradient(180deg, #002648 0%, #00132a 100%)', border: '#003d7a', accent: 'var(--accent-blue)',   chip: 'var(--accent-blue)',   chipText: 'var(--color-black)', label: 'STEADY' },
  push:     { bg: 'linear-gradient(180deg, #0e2a14 0%, #07140a 100%)', border: '#1a5c2a', accent: 'var(--accent-green)',  chip: 'var(--accent-green)',  chipText: 'var(--color-black)', label: 'GREEN LIGHT' },
}

export default function RestRecommendation({ data }: Props) {
  const r = analyzeRecovery(data)
  const s = analyzeSleep(data)
  const rec = buildRestRecommendation(data)
  const theme = STATUS_THEME[rec.status]

  // Fatigue gauge (semi-circle)
  const F = Math.min(100, Math.max(0, r.fatigueScore))
  const angle = (F / 100) * 180 // 0..180 deg
  const arcR = 64
  const cx = 80, cy = 70
  const arcEnd = (a: number) => ({
    x: cx + arcR * Math.cos((180 - a) * Math.PI / 180),
    y: cy - arcR * Math.sin((180 - a) * Math.PI / 180),
  })
  const start = arcEnd(0)
  const end = arcEnd(angle)
  const fullEnd = arcEnd(180)
  const largeArc = angle > 180 ? 1 : 0

  const loadArrow = r.loadDeltaMin > 0 ? '↑' : r.loadDeltaMin < 0 ? '↓' : '·'
  const signals = [
    { k: 'VO₂ trend',     v: `${r.vo2DeltaPct.toFixed(1)}%`,                                tone: r.vo2DeltaPct < -2 ? 'bad' : r.vo2DeltaPct > 0 ? 'good' : 'flat' },
    { k: 'RHR Δ baseline', v: r.rhrDelta !== null ? `${r.rhrDelta > 0 ? '+' : ''}${r.rhrDelta.toFixed(1)} bpm` : '—', tone: r.rhrDelta !== null && r.rhrDelta > 3 ? 'bad' : 'flat' },
    { k: 'HRV Δ baseline', v: r.hrvDelta !== null ? `${r.hrvDelta > 0 ? '+' : ''}${r.hrvDelta.toFixed(1)} ms` : '—', tone: r.hrvDelta !== null && r.hrvDelta < -5 ? 'bad' : r.hrvDelta !== null && r.hrvDelta > 5 ? 'good' : 'flat' },
    { k: 'Walking HR 14d',v: r.walkingHrRecent !== null ? `${r.walkingHrRecent.toFixed(0)} bpm` : '—', tone: r.walkingHrRecent !== null && r.walkingHrRecent > 130 ? 'bad' : 'flat' },
    { k: 'Load 7d→7d',    v: `${loadArrow} ${r.loadDeltaMin > 0 ? '+' : ''}${r.loadDeltaMin} min`,    tone: r.loadTrend === 'rising' ? 'bad' : r.loadTrend === 'declining' ? 'good' : 'flat' },
    { k: 'Sleep stdev',   v: `±${s.variability.toFixed(2)} h`,                  tone: s.consistency === 'erratic' ? 'bad' : s.consistency === 'tight' ? 'good' : 'flat' },
    { k: 'Deep sleep avg',v: `${s.avgDeepPct.toFixed(1)}%`,                     tone: s.deepBelowTarget ? 'bad' : 'good' },
    { k: 'Constraints',   v: `${data.profile.current_constraints.length} active`, tone: data.profile.current_constraints.length > 0 ? 'bad' : 'good' },
  ]
  const toneColor = (t: string) => t === 'bad' ? 'var(--accent-coral)' : t === 'good' ? 'var(--accent-green)' : 'var(--color-white)'

  return (
    <section id="rest">
      <SectionHeader label="Recommended Rest Period" meta={`fatigue ${F}/100`} />

      {/* Top status card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{
          background: theme.bg, border: `1px solid ${theme.border}`, borderTop: 'none', padding: '18px 16px',
          boxShadow: `inset 0 1px 0 ${theme.accent}33, 0 0 24px ${theme.accent}1a`,
          display: 'grid', gridTemplateColumns: '160px 1fr', gap: '14px', alignItems: 'center',
        }}
      >
        {/* Gauge */}
        <div style={{ position: 'relative', width: '160px', height: '90px' }}>
          <svg viewBox="0 0 160 90" style={{ width: '100%', height: '100%' }}>
            <path d={`M ${start.x} ${start.y} A ${arcR} ${arcR} 0 1 1 ${fullEnd.x} ${fullEnd.y}`} stroke="#1c1c1c" strokeWidth="10" fill="none" strokeLinecap="round" />
            <motion.path
              initial={{ pathLength: 0 }} whileInView={{ pathLength: F / 100 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              d={`M ${start.x} ${start.y} A ${arcR} ${arcR} 0 ${largeArc} 1 ${end.x} ${end.y}`}
              stroke={theme.accent} strokeWidth="10" fill="none" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 6px ${theme.accent})` }}
            />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '20px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '34px', color: theme.accent, lineHeight: 1 }}>{F}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginTop: '2px' }}>fatigue</div>
          </div>
        </div>
        <div>
          <div style={{ display: 'inline-block', background: theme.chip, color: theme.chipText, fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', fontWeight: 700, padding: '3px 8px', borderRadius: '2px', marginBottom: '8px' }}>{theme.label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: theme.accent, letterSpacing: '0.5px', lineHeight: 1.1, marginBottom: '6px' }}>{rec.headline}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-white)', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--color-mid)' }}>Duration:</span> <span style={{ color: theme.accent, fontWeight: 600 }}>{rec.durationDays} day{rec.durationDays !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </motion.div>

      {/* Rationale signals grid */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '14px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '10px' }}>Recovery Signals</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 16px' }}>
          {signals.map(sg => (
            <div key={sg.k} style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '11px', borderBottom: '1px dashed #1c1c1c', padding: '4px 0' }}>
              <span style={{ color: 'var(--color-mid)' }}>{sg.k}</span>
              <span style={{ color: toneColor(sg.tone), fontWeight: 600 }}>{sg.v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '10px', fontFamily: 'var(--font-sans)', fontSize: '11px', color: 'var(--color-mid)', lineHeight: 1.55 }}>
          <span style={{ color: 'var(--color-mid)', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em' }}>RATIONALE</span><br />
          {rec.rationale}
        </div>
      </div>

      {/* Daily protocol */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '14px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '10px' }}>Daily Protocol</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rec.daily_protocol.map((p, i) => (
            <motion.div key={p.label}
              initial={{ opacity: 0, x: -6 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
              style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px', padding: '6px 0', borderBottom: '1px dashed #1c1c1c' }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: theme.accent, fontWeight: 600, letterSpacing: '0.05em' }}>{p.label}</span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-white)', lineHeight: 1.45 }}>{p.detail}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Do / Avoid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        <div style={{ background: 'var(--color-card)', padding: '14px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent-green)', textTransform: 'uppercase', marginBottom: '8px' }}>✓ Do</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {rec.do.map(d => (
              <li key={d} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-white)', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
                <span style={{ color: 'var(--accent-green)', flexShrink: 0 }}>›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ background: 'var(--color-card)', padding: '14px 14px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--accent-coral)', textTransform: 'uppercase', marginBottom: '8px' }}>✕ Avoid</div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {rec.avoid.map(d => (
              <li key={d} style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-white)', lineHeight: 1.5, display: 'flex', gap: '6px' }}>
                <span style={{ color: 'var(--accent-coral)', flexShrink: 0 }}>›</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Living return criteria */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '14px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: theme.accent, textTransform: 'uppercase' }}>Return-to-Train · Live</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)' }}>{rec.return_criteria.filter(c => c.met).length}/{rec.return_criteria.length} ready</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rec.return_criteria.map(c => (
            <motion.div key={c.label}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              style={{ display: 'grid', gridTemplateColumns: '18px 1fr auto', gap: '8px', alignItems: 'flex-start', padding: '6px 0', borderBottom: '1px dashed #1c1c1c' }}
            >
              {c.met ? (
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: 'var(--accent-green)', color: 'var(--color-black)', fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>✓</span>
              ) : (
                <span style={{ width: '14px', height: '14px', borderRadius: '3px', border: '1.5px solid var(--accent-coral)', background: 'rgba(255,107,107,0.08)', marginTop: '1px' }} />
              )}
              <div>
                <div style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500, color: 'var(--color-white)', lineHeight: 1.4 }}>{c.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '2px' }}>
                  <span style={{ color: 'var(--color-mid)' }}>target</span> {c.target}
                  <span style={{ color: 'var(--color-dim)' }}> · </span>
                  <span style={{ color: 'var(--color-mid)' }}>now</span>
                  <span style={{ color: c.met ? 'var(--accent-green)' : 'var(--accent-coral)', fontWeight: 600 }}> {c.current}</span>
                </div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: c.met ? 'var(--accent-green)' : 'var(--accent-coral)', fontWeight: 700, letterSpacing: '0.1em' }}>{c.met ? 'OK' : 'WAIT'}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
