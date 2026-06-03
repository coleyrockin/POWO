'use client'
import { m } from 'framer-motion'
import SectionHeader from './SectionHeader'

const CARDS = [
  { variant: 'overview', label: 'Overview', desc: '6-month totals', color: 'var(--accent-blue)' },
  { variant: 'week', label: 'This Week', desc: 'Week-over-week', color: 'var(--accent-green)' },
  { variant: 'activity', label: 'By Activity', desc: 'Workout breakdown', color: 'var(--accent-amber)' },
  { variant: 'story', label: 'Story', desc: '9:16 for IG/TikTok', color: 'var(--accent-purple)' },
]

export default function ShareCards() {
  return (
    <section id="share">
      <SectionHeader label="Share" meta="Download stat cards" />
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
        {CARDS.map((c, i) => (
          <m.a
            key={c.variant}
            href={`/api/cards/${c.variant}`}
            download={`powo-${c.variant}.png`}
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
            className="powo-lift"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              padding: '15px 13px 13px',
              borderRadius: '8px',
              borderTop: `2px solid ${c.color}`,
              textDecoration: 'none',
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', lineHeight: 1, color: 'var(--color-white)', letterSpacing: '0.5px' }}>{c.label}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--color-mid)' }}>{c.desc}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: c.color, marginTop: '6px', letterSpacing: '0.12em' }}>↓ PNG</span>
          </m.a>
        ))}
      </div>
    </section>
  )
}
