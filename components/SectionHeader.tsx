'use client'
import { m } from 'framer-motion'

interface Props {
  label: string
  meta?: string
  level?: 2 | 3
}

export default function SectionHeader({ label, meta, level = 2 }: Props) {
  const Heading = level === 3 ? 'h3' : 'h2'
  return (
    <m.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="powo-section-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        minHeight: '46px',
        padding: '13px 16px',
        position: 'relative',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', flex: '0 0 auto' }}>
        <m.span
          aria-hidden
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="powo-tick"
          style={{
            display: 'inline-block',
            width: '2px',
            height: '14px',
            background: 'var(--accent-blue)',
            transformOrigin: 'top',
            flexShrink: 0,
          }}
        />
        <Heading
          style={{
            fontFamily: 'var(--font-mono)',
            // Phone pins to 11px (preferred term < 11 at 390px); scales to 15px on desktop.
            fontSize: 'clamp(11px, calc(8px + 0.7vw), 15px)',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-white)',
            whiteSpace: 'nowrap',
            margin: 0,
          }}
        >
          {label}
        </Heading>
      </span>
      {meta && (
        <span
          title={meta}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(10px, calc(8px + 0.45vw), 12px)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-blue-dim)',
            whiteSpace: 'nowrap',
            textAlign: 'right',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: '1 1 auto',
          }}
        >
          {meta}
        </span>
      )}
    </m.div>
  )
}
