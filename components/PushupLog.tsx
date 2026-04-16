'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { Pushup } from '@/lib/types'

interface Props { pushups: Pushup[], total: number }

const DAY_LABELS: Record<string, string> = {
  '2026-04-06': 'Sun Apr 6',
  '2026-04-08': 'Tue Apr 8',
  '2026-04-10': 'Thu Apr 10',
  '2026-04-11': 'Fri Apr 11',
  '2026-04-12': 'Sat Apr 12',
}
const DAY_NOTES: Record<string, string> = {
  '2026-04-06': 'Rest day',
  '2026-04-08': 'High output',
  '2026-04-10': 'Moderate',
  '2026-04-11': 'Best set',
  '2026-04-12': 'Quick set',
}

export default function PushupLog({ pushups, total }: Props) {
  const bestReps = Math.max(...pushups.map(p => p.reps))
  return (
    <section>
      <SectionHeader label="Pushup Log" meta="Week of Apr 6–12" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {pushups.map((p, i) => {
          const isBest = p.reps === bestReps
          return (
            <motion.div
              key={p.date}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="powo-lift"
              style={{ background: 'var(--color-card)', padding: '20px 16px', textAlign: 'center', position: 'relative' }}
            >
              {isBest && (
                <div style={{
                  position: 'absolute', top: '8px', right: '8px',
                  fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.18em',
                  color: 'var(--color-black)', background: 'var(--accent-amber)',
                  padding: '2px 5px', borderRadius: '2px', fontWeight: 600,
                }}>
                  PR
                </div>
              )}
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '8px' }}>{DAY_LABELS[p.date]}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', lineHeight: 1, color: isBest ? 'var(--accent-amber)' : 'var(--color-wolf)' }}>{p.reps}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)', marginTop: '6px' }}>{DAY_NOTES[p.date]}</div>
            </motion.div>
          )
        })}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28 }}
          className="powo-lift"
          style={{ background: '#0a1f0a', border: '1px solid #1a5c2a', margin: '-1px', padding: '20px 16px', textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '8px' }}>Weekly Total</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', lineHeight: 1, color: 'var(--color-wolf)' }}>{total}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)', marginTop: '6px' }}>5 sessions</div>
        </motion.div>
      </div>
    </section>
  )
}
