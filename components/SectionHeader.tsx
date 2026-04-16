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
      style={{ borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}
    >
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-mid)' }}>
        {label}
      </span>
      {meta && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-wolf2)' }}>
          {meta}
        </span>
      )}
    </motion.div>
  )
}
