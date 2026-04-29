'use client'
import { motion } from 'framer-motion'
import SectionHeader from './SectionHeader'
import type { VO2Point } from '@/lib/types'

interface Props { trend: VO2Point[] }

const MIN_VAL = 33
const MAX_VAL = 39
const W = 360
const H = 190
const PAD_L = 32
const PAD_R = 18
const PAD_T = 28
const PAD_B = 30
const BASE_Y = H - PAD_B
const DRAW_W = W - PAD_L - PAD_R
const DRAW_H = BASE_Y - PAD_T

function dayIndex(iso: string, base: number): number {
  return Math.round((new Date(iso + 'T00:00:00').getTime() - base) / 86400000)
}

function px(di: number, totalDays: number): number {
  return (di / totalDays) * DRAW_W + PAD_L
}

function py(val: number): number {
  const clamped = Math.max(MIN_VAL, Math.min(MAX_VAL, val))
  return BASE_Y - ((clamped - MIN_VAL) / (MAX_VAL - MIN_VAL)) * DRAW_H
}

type Pt = { x: number; y: number }

function smoothLine(pts: Pt[]): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    const mx = (prev.x + curr.x) / 2
    d += ` C ${mx.toFixed(2)} ${prev.y.toFixed(2)}, ${mx.toFixed(2)} ${curr.y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`
  }
  return d
}

function smoothArea(pts: Pt[]): string {
  if (pts.length === 0) return ''
  const last = pts[pts.length - 1]
  const first = pts[0]
  return `${smoothLine(pts)} L ${last.x.toFixed(2)} ${BASE_Y} L ${first.x.toFixed(2)} ${BASE_Y} Z`
}

export default function VO2Chart({ trend }: Props) {
  const baseMs = new Date(trend[0].date + 'T00:00:00').getTime()
  const endMs = new Date(trend[trend.length - 1].date + 'T00:00:00').getTime()
  const totalDays = Math.max(1, Math.round((endMs - baseMs) / 86400000))

  const coords = trend.map(p => ({
    ...p,
    x: px(dayIndex(p.date, baseMs), totalDays),
    y: py(p.value),
  }))

  const peak = trend.reduce((a, b) => (b.value > a.value ? b : a))
  const peakIdx = coords.findIndex(c => c.date === peak.date)
  const peakCoord = coords[peakIdx]
  const current = trend[trend.length - 1]
  const curCoord = coords[coords.length - 1]
  const first = trend[0]
  const sinceFirst = ((current.value - first.value) / first.value) * 100
  const fromPeak = ((current.value - peak.value) / peak.value) * 100

  const preCoords = coords.slice(0, peakIdx + 1)
  const postCoords = coords.slice(peakIdx)

  // Anchor month labels to actual data positions
  const monthAnchors: { label: string; x: number }[] = []
  const seen = new Set<string>()
  coords.forEach(c => {
    const m = new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    if (!seen.has(m)) { seen.add(m); monthAnchors.push({ label: m, x: c.x }) }
  })

  return (
    <section id="vo2">
      <SectionHeader label="VO₂ Max · 91-Day Trajectory" meta={`${trend.length} readings`} />
      <motion.div
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '20px 16px 18px' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-mid)', marginBottom: '4px' }}>First</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '22px', lineHeight: 1, color: 'var(--color-white)' }}>{first.value.toFixed(1)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '2px' }}>{new Date(first.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-amber)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>Peak <span style={{ background: 'var(--accent-amber)', color: 'var(--color-black)', padding: '0px 4px', fontSize: '9px', fontWeight: 700, borderRadius: '2px' }}>PR</span></div>
            <div className="powo-glow-amber" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1, color: 'var(--accent-amber)' }}>{peak.value.toFixed(2)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '2px' }}>{new Date(peak.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-teal)', marginBottom: '4px' }}>Current</div>
            <div className="powo-glow-teal" style={{ fontFamily: 'var(--font-display)', fontSize: '28px', lineHeight: 1, color: 'var(--accent-teal)' }}>{current.value.toFixed(2)}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '2px' }}>{new Date(current.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
          </div>
        </div>

        <div style={{ width: '100%', overflow: 'visible' }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Horizontal "story" fill — green ascent, amber peak, coral decline */}
              <linearGradient id="vo2StoryFill" gradientUnits="userSpaceOnUse" x1={PAD_L} y1="0" x2={W - PAD_R} y2="0">
                <stop offset="0%" stopColor="var(--accent-teal)" stopOpacity="0.05" />
                <stop offset={`${((peakCoord.x - PAD_L) / DRAW_W) * 100}%`} stopColor="var(--accent-amber)" stopOpacity="0.42" />
                <stop offset="100%" stopColor="var(--accent-coral)" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="vo2StoryFillVert" gradientUnits="userSpaceOnUse" x1="0" y1={PAD_T} x2="0" y2={BASE_Y}>
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="vo2LineRise" gradientUnits="userSpaceOnUse" x1={PAD_L} y1="0" x2={peakCoord.x} y2="0">
                <stop offset="0%" stopColor="#5fe7c7" />
                <stop offset="60%" stopColor="var(--accent-teal)" />
                <stop offset="100%" stopColor="var(--accent-amber)" />
              </linearGradient>
              <linearGradient id="vo2LineFall" gradientUnits="userSpaceOnUse" x1={peakCoord.x} y1="0" x2={W - PAD_R} y2="0">
                <stop offset="0%" stopColor="var(--accent-amber)" />
                <stop offset="100%" stopColor="var(--accent-coral)" />
              </linearGradient>
              {/* Vertical light beam at peak — soft amber column */}
              <linearGradient id="vo2PeakBeam" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-amber)" stopOpacity="0" />
                <stop offset="50%" stopColor="var(--accent-amber)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--accent-amber)" stopOpacity="0" />
              </linearGradient>
              <filter id="vo2lineGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.4" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="vo2peakGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="vo2beamBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" />
              </filter>
            </defs>

            {/* Y gridlines + labels */}
            {[34, 36, 38].map(g => {
              const y = py(g)
              return (
                <g key={g}>
                  <line x1={PAD_L} x2={W - PAD_R} y1={y} y2={y} stroke="rgba(255,255,255,0.09)" strokeWidth="1" strokeDasharray="2 5" />
                  <text x={PAD_L - 6} y={y + 3} textAnchor="end" fill="#8b8b92" fontFamily="DM Mono, monospace" fontSize="9.5">{g}</text>
                </g>
              )
            })}

            {/* Peak beam — soft vertical light column behind the line */}
            <motion.rect
              x={peakCoord.x - 22}
              y={PAD_T - 8}
              width={44}
              height={BASE_Y - PAD_T + 8}
              fill="url(#vo2PeakBeam)"
              filter="url(#vo2beamBlur)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.25 }}
            />

            {/* Vertical guide at peak — sharp dashed accent on top of beam */}
            <line x1={peakCoord.x} x2={peakCoord.x} y1={PAD_T - 6} y2={BASE_Y} stroke="var(--accent-amber)" strokeWidth="1" strokeDasharray="2 4" opacity="0.55" />

            {/* Baseline */}
            <line x1={PAD_L} x2={W - PAD_R} y1={BASE_Y} y2={BASE_Y} stroke="rgba(255,255,255,0.09)" strokeWidth="1" />

            {/* Unified story fill — green ascent through amber peak to coral decline */}
            <motion.path
              d={smoothArea(coords)}
              fill="url(#vo2StoryFill)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d={smoothArea(coords)}
              fill="url(#vo2StoryFillVert)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.15 }}
            />

            {/* Pre-peak line: rise gradient teal → amber */}
            <motion.path
              d={smoothLine(preCoords)}
              fill="none"
              stroke="url(#vo2LineRise)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              filter="url(#vo2lineGlow)"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Post-peak line: decline gradient amber → coral, dashed */}
            <motion.path
              d={smoothLine(postCoords)}
              fill="none"
              stroke="url(#vo2LineFall)"
              strokeWidth="2.2"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeDasharray="4 3"
              filter="url(#vo2lineGlow)"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Reading dots — subtle cadence breadcrumbs along the line */}
            {coords.map((p, i) => (
              i === peakIdx || i === coords.length - 1 ? null : (
                <circle key={`d${i}`} cx={p.x} cy={p.y} r="1.6" fill={i > peakIdx ? 'var(--accent-coral)' : 'var(--accent-teal)'} opacity="0.55" />
              )
            ))}

            {/* Peak marker — pulsing halo */}
            <g>
              <motion.circle
                cx={peakCoord.x}
                cy={peakCoord.y}
                fill="var(--accent-amber)"
                animate={{ r: [12, 18, 12], opacity: [0.18, 0.04, 0.18] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle cx={peakCoord.x} cy={peakCoord.y} r="7" fill="var(--accent-amber)" opacity="0.34" filter="url(#vo2peakGlow)" />
              <circle cx={peakCoord.x} cy={peakCoord.y} r="4" fill="#0d0d0d" stroke="var(--accent-amber)" strokeWidth="2" />
              {/* Label box positioned above the dot, with leader space */}
              <g transform={`translate(${peakCoord.x}, ${peakCoord.y - 20})`}>
                <rect x={-22} y={-11} width={44} height={15} rx={2} fill="#0d0d0d" stroke="var(--accent-amber)" strokeWidth="1" opacity="0.95" />
                <text x={0} y={0} textAnchor="middle" fill="var(--accent-amber)" fontFamily="DM Mono, monospace" fontSize="10" fontWeight="700">{peak.value.toFixed(2)}</text>
              </g>
            </g>

            {/* Current marker — anchored label that flips off-line */}
            <g>
              <circle cx={curCoord.x} cy={curCoord.y} r="9" fill="var(--accent-teal)" opacity="0.16" />
              <circle cx={curCoord.x} cy={curCoord.y} r="3.5" fill="#0d0d0d" stroke="var(--accent-teal)" strokeWidth="2" />
              <g transform={`translate(${Math.min(curCoord.x, W - PAD_R - 2)}, ${curCoord.y + 18})`}>
                <rect x={-22} y={-10} width={44} height={14} rx={2} fill="#0d0d0d" stroke="var(--accent-teal)" strokeWidth="1" opacity="0.95" />
                <text x={0} y={0} textAnchor="middle" fill="var(--accent-teal)" fontFamily="DM Mono, monospace" fontSize="10" fontWeight="600">{current.value.toFixed(2)}</text>
              </g>
            </g>

            {/* Month labels anchored to first reading of each month */}
            {monthAnchors.map((m, i) => (
              <text key={`m${i}`} x={m.x} y={H - 8} textAnchor="middle" fill="#8b8b92" fontFamily="DM Mono, monospace" fontSize="9.5" letterSpacing="1">{m.label}</text>
            ))}
          </svg>
        </div>

        <div style={{ marginTop: '14px', padding: '12px 12px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.035)', borderRadius: '6px', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: 'var(--accent-amber)', textTransform: 'uppercase' }}>First → Peak</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--accent-amber)' }}>+{(((peak.value - first.value) / first.value) * 100).toFixed(1)}%</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '2px' }}>60-day rise</div>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', color: fromPeak < 0 ? 'var(--accent-coral)' : 'var(--accent-green)', textTransform: 'uppercase' }}>Peak → Today</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: fromPeak < 0 ? 'var(--accent-coral)' : 'var(--accent-green)' }}>{fromPeak.toFixed(1)}%</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', marginTop: '2px' }}>19-day decline · rest signal</div>
          </div>
          <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed rgba(255,255,255,0.08)', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', letterSpacing: '0.12em' }}>FIRST → TODAY</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: sinceFirst >= 0 ? 'var(--accent-green)' : 'var(--accent-coral)', fontWeight: 600 }}>{sinceFirst >= 0 ? '+' : ''}{sinceFirst.toFixed(1)}%</span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
