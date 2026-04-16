'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { FiatCurrency } from '@/lib/types'

interface Props { currencies: FiatCurrency[] }

function Change({ value }: { value: number }) {
  const up = value >= 0
  const color = up ? 'var(--color-wolf)' : '#e05c5c'
  const sign = up ? '+' : ''
  return (
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color }}>
      {sign}{value.toFixed(2)}%
    </span>
  )
}

export default function FiatCurrencies({ currencies }: Props) {
  return (
    <section>
      <SectionHeader label="Top 10 Currencies" meta="vs USD · Apr 15 2026" />
      <div style={{ border: '1px solid var(--color-border)', borderTop: 'none' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'Code', 'Currency', '1 Unit = USD', '24h', '7d'].map((h, i) => (
                <th key={i} style={{
                  background: 'var(--color-card)',
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  letterSpacing: '0.15em', textTransform: 'uppercase',
                  color: 'var(--color-mid)',
                  borderBottom: '1px solid var(--color-border)',
                  padding: '12px 12px',
                  textAlign: i < 3 ? 'left' : 'right',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currencies.map((c, i) => (
              <motion.tr
                key={c.code}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                style={{ background: '#0a0a0a', borderBottom: '1px solid #161616' }}
              >
                <td style={{ padding: '11px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)', width: '28px' }}>
                  {c.rank}
                </td>
                <td style={{ padding: '11px 12px', fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 500, color: 'var(--color-wolf)', whiteSpace: 'nowrap' }}>
                  {c.code}
                </td>
                <td style={{ padding: '11px 12px', fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-white)', whiteSpace: 'nowrap' }}>
                  {c.name}
                </td>
                <td style={{ padding: '11px 12px', textAlign: 'right', fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-white)', whiteSpace: 'nowrap' }}>
                  ${c.usd_per_unit < 0.01
                    ? c.usd_per_unit.toFixed(4)
                    : c.usd_per_unit.toFixed(4)}
                </td>
                <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                  <Change value={c.change_24h} />
                </td>
                <td style={{ padding: '11px 12px', textAlign: 'right' }}>
                  <Change value={c.change_7d} />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
