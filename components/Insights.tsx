'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { buildInsights } from '@/lib/helpers'
import type { HealthData } from '@/lib/types'

interface Props { data: HealthData }

export default function Insights({ data }: Props) {
  const { narrative, correlations, signals } = buildInsights(data)

  return (
    <section id="insights">
      <SectionHeader label="Insights" meta="patterns in your data" />
      <motion.div
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}
      >
        {/* Auto-narrative */}
        <div style={{ background: 'linear-gradient(180deg, rgba(0,212,170,0.07), transparent)', borderRadius: '6px', padding: '12px 12px', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.2em', color: 'var(--accent-teal)', textTransform: 'uppercase', marginBottom: '6px' }}>Read</div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', lineHeight: 1.55, color: 'var(--color-white)' }}>{narrative}</div>
        </div>

        {/* Correlation cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginBottom: '14px' }}>
          {correlations.map((c, i) => (
            <motion.div
              key={c.key}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="powo-lift"
              style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '12px 13px', borderLeft: `2px solid ${c.accent}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.03em', color: 'var(--color-white)' }}>{c.title}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', lineHeight: 1, color: c.accent }}>{c.r >= 0 ? '+' : ''}{c.r.toFixed(2)}</span>
              </div>
              <div style={{ marginTop: '8px', height: '4px', background: 'var(--color-track, #0a0a0a)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(Math.abs(c.r) * 100, 100)}%`, height: '100%', background: c.accent, borderRadius: '2px' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)' }}>
                <span>{c.xLabel} → {c.yLabel}</span>
                <span style={{ color: c.smallSample ? 'var(--accent-amber)' : 'var(--color-mid)' }}>n={c.n}{c.smallSample ? ' · small n' : ''}</span>
              </div>
              <div style={{ marginTop: '6px', fontFamily: 'var(--font-sans)', fontSize: '12px', lineHeight: 1.5, color: 'var(--color-faint)' }}>{c.read}</div>
            </motion.div>
          ))}
        </div>

        {/* Latent signal tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {signals.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="powo-lift"
              style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '11px 12px' }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '5px' }}>{s.title}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '19px', lineHeight: 1, color: s.accent }}>{s.value}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-faint)', marginTop: '5px', lineHeight: 1.4 }}>{s.detail}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
