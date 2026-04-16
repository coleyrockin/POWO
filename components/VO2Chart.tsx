'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { VO2Point } from '@/lib/types'

interface Props { trend: VO2Point[] }

const DATE_LABELS = ['Feb 1','Feb 8','Feb 15','Feb 22','Mar 1','Mar 8','Apr 12']
const MIN_VAL = 32
const MAX_VAL = 40
const W = 700
const H = 120
const PAD = 10

function toCoords(points: VO2Point[]) {
  return points.map((p, i) => ({
    x: (i / (points.length - 1)) * (W - PAD * 2) + PAD,
    y: H - PAD - ((p.value - MIN_VAL) / (MAX_VAL - MIN_VAL)) * (H - PAD * 2),
  }))
}

export default function VO2Chart({ trend }: Props) {
  const coords = toCoords(trend)
  const polyline = coords.map(p => `${p.x},${p.y}`).join(' ')
  const area = `${coords[0].x},${H} ${polyline} ${coords[coords.length - 1].x},${H}`
  const current = trend[trend.length - 1].value

  return (
    <section>
      <SectionHeader label="VO₂ Max Trend" meta="Feb → Apr 2026" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '24px 20px' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Cardio Fitness Score
              <span style={{
                fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.18em',
                color: 'var(--color-black)', background: 'var(--accent-amber)',
                padding: '1px 5px', borderRadius: '2px', fontWeight: 600,
              }}>
                PR
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '48px', lineHeight: 1, color: 'var(--color-wolf)' }}>
              {current.toFixed(1)}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', color: 'var(--color-mid)', marginLeft: '8px' }}>mL/kg/min</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-wolf)' }}>↑ +14.7%</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)' }}>33.4 → {current.toFixed(2)}</div>
          </div>
        </div>

        <div style={{ width: '100%', overflow: 'hidden' }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '90px' }} preserveAspectRatio="none">
            <defs>
              <linearGradient id="vo2grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-wolf)" stopOpacity="0.2" />
                <stop offset="100%" stopColor="var(--color-wolf)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={area} fill="url(#vo2grad)" />
            <polyline points={polyline} fill="none" stroke="var(--color-wolf)" strokeWidth="2" strokeLinejoin="round" />
            {coords.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#080808" stroke="var(--color-wolf)" strokeWidth="2" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--color-wolf)" fontFamily="DM Mono, monospace" fontSize="9">
                  {trend[i].value}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)', marginTop: '4px' }}>
          {DATE_LABELS.map(l => <span key={l}>{l}</span>)}
        </div>
      </motion.div>
    </section>
  )
}
