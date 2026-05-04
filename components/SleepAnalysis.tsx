'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { SleepData } from '@/lib/types'

interface Props { sleep: SleepData }

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

function fmtHM(hours: number) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h}h ${m}m`
}

export default function SleepAnalysis({ sleep }: Props) {
  const nights = sleep.nights
  const s = sleep.summary
  const longest = nights.reduce((a, b) => (b.total_sleep_hours > a.total_sleep_hours ? b : a))
  const shortest = nights.reduce((a, b) => (b.total_sleep_hours < a.total_sleep_hours ? b : a))
  const rangeLabel = `${fmtDate(nights[0].date)} → ${fmtDate(nights[nights.length - 1].date)}`

  // Per-night composition bars (proportional to total)
  const maxTotal = Math.max(...nights.map(n => n.total_sleep_hours))

  return (
    <section id="sleep">
      <SectionHeader label="Sleep Analysis" meta={`${s.nights_with_data} nights · stages tracked`} />

      {/* Coverage note — moved to top so reader sees the gap before the data */}
      <div style={{ background: 'linear-gradient(180deg, #1a1505 0%, #0d0a02 100%)', border: '1px solid #5c4214', borderTop: 'none', padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-black)', background: 'var(--accent-amber)', padding: '2px 5px', borderRadius: '2px', fontWeight: 700, letterSpacing: '0.14em', flexShrink: 0, marginTop: '1px' }}>GAP</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', lineHeight: 1.5 }}>{sleep.coverage_note}</span>
      </div>

      {/* Summary stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignItems: 'stretch', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {[
          { label: 'Avg Total',  val: s.avg_total_hours.toFixed(2),  unit: 'hrs',  color: 'var(--accent-blue)'   },
          { label: 'Avg Deep',   val: s.avg_deep_pct.toFixed(1) + '%', unit: 'of TST', color: 'var(--accent-coral)' },
          { label: 'Avg REM',    val: s.avg_rem_pct.toFixed(1) + '%',  unit: 'of TST', color: 'var(--accent-amber)' },
          { label: 'Stdev',      val: '±' + s.stdev_hours.toFixed(2), unit: 'consistency', color: 'var(--accent-purple)' },
        ].map(t => (
          <div key={t.label} className="powo-lift" style={{ background: 'var(--color-card)', padding: '16px 14px', minHeight: '92px', height: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '4px' }}>{t.label}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: t.color, lineHeight: 1 }}>{t.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)', marginTop: '3px' }}>{t.unit}</div>
          </div>
        ))}
      </div>

      {/* Per-night stage bars */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '4px' }}>Stage Composition · {rangeLabel}</div>
        <div style={{ display: 'flex', gap: '12px', fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginBottom: '10px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', background: 'var(--accent-coral)', borderRadius: '2px' }} /> Deep</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', background: 'var(--accent-amber)', borderRadius: '2px' }} /> REM</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', background: 'var(--accent-blue)', borderRadius: '2px' }} /> Core</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
          {nights.map((n, i) => {
            const isLongest = n.date === longest.date
            const isShortest = n.date === shortest.date
            const totalPct = (n.total_sleep_hours / maxTotal) * 100
            const deepPct = (n.deep_hours / n.total_sleep_hours) * 100
            const remPct = (n.rem_hours / n.total_sleep_hours) * 100
            const corePct = (n.core_hours / n.total_sleep_hours) * 100
            return (
              <motion.div key={n.date}
                initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                style={{ display: 'grid', gridTemplateColumns: '52px 1fr 64px', alignItems: 'center', gap: '8px' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: isLongest ? 'var(--accent-amber)' : isShortest ? 'var(--accent-coral)' : 'var(--color-mid)', fontWeight: isLongest || isShortest ? 600 : 400 }}>{fmtDate(n.date)}</span>
                <div style={{ height: '14px', borderRadius: '3px', background: '#0a0a0a', display: 'flex', overflow: 'hidden', boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.4)', width: `${totalPct}%` }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${deepPct}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 }} style={{ background: 'var(--accent-coral)', height: '100%' }} />
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${remPct}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 + 0.05 }} style={{ background: 'var(--accent-amber)', height: '100%' }} />
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${corePct}%` }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.04 + 0.1 }} style={{ background: 'var(--accent-blue)', height: '100%' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '13px', color: isLongest ? 'var(--accent-amber)' : 'var(--color-white)', textAlign: 'right' }}>{fmtHM(n.total_sleep_hours)}</span>
              </motion.div>
            )
          })}
        </div>
      </div>

    </section>
  )
}
