'use client'
import { motion } from 'framer-motion'

interface Props {
  label: string
  meta?: string
}

export default function SectionHeader({ label, meta }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      style={{
        border: '1px solid var(--color-border)',
        borderBottom: '1px solid rgba(255,255,255,0.035)',
        background: 'linear-gradient(180deg, rgba(22,22,25,0.82), rgba(12,12,14,0.94))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        minHeight: '46px',
        padding: '13px 16px',
        position: 'relative',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 auto' }}>
        <motion.span
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
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--color-white)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {label}
        </span>
      </span>
      {meta && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--accent-blue-dim)',
            whiteSpace: 'nowrap',
            textAlign: 'right',
            flex: '0 1 auto',
          }}
        >
          {meta}
        </span>
      )}
    </motion.div>
  )
}
