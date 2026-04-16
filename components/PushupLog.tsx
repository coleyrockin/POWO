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
}
const DAY_NOTES: Record<string, string> = {
  '2026-04-06': 'Rest day',
  '2026-04-08': 'High output',
  '2026-04-10': 'Moderate',
  '2026-04-11': 'Best set',
}

export default function PushupLog({ pushups, total }: Props) {
  return (
    <section>
      <SectionHeader label="Pushup Log" meta="Week of Apr 6–12" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {pushups.map((p, i) => (
          <motion.div
            key={p.date}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            style={{ background: 'var(--color-card)', padding: '20px 16px', textAlign: 'center' }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '8px' }}>{DAY_LABELS[p.date]}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', lineHeight: 1, color: 'var(--color-wolf)' }}>{p.reps}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)', marginTop: '6px' }}>{DAY_NOTES[p.date]}</div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.28 }}
          style={{ background: '#0c1200', border: '1px solid #2a4400', margin: '-1px', padding: '20px 16px', textAlign: 'center' }}
        >
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '8px' }}>Weekly Total</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '64px', lineHeight: 1, color: 'var(--color-wolf)' }}>{total}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)', marginTop: '6px' }}>4 sessions</div>
        </motion.div>
      </div>
    </section>
  )
}
