'use client'
import { m, useReducedMotion } from 'framer-motion'

interface Props {
  /** Active point, in SVG user units. */
  x: number
  y: number
  /** Vertical extent of the crosshair line (drawing-area top + baseline). */
  topY: number
  baseY: number
  /** Tooltip text. */
  label: string
  value: string
  /** Accent (CSS var or hex) for the line, dot stroke, and value text. */
  accentColor: string
  /** viewBox width, used to keep the tooltip box inside the frame. */
  viewBoxWidth: number
}

/**
 * SVG crosshair + focus dot + value tooltip. Rendered as the last child inside a
 * chart's <svg> so it sits on top, and only when there is an active point — the
 * default (no-hover) render is therefore unchanged. Coordinates are SVG user units.
 */
export default function ChartCursor({ x, y, topY, baseY, label, value, accentColor, viewBoxWidth }: Props) {
  const reduced = useReducedMotion()

  // Tooltip box sizing — DM Mono is monospace, so width estimates from char counts.
  const boxW = Math.max(label.length * 6.0, value.length * 6.4) + 14
  const boxH = 30
  const placeAbove = y - boxH - 12 >= topY
  const boxY = placeAbove ? y - boxH - 10 : y + 10
  const boxX = Math.max(2, Math.min(x - boxW / 2, viewBoxWidth - boxW - 2))

  const content = (
    <>
      <line x1={x} x2={x} y1={topY} y2={baseY} stroke={accentColor} strokeWidth={1} strokeDasharray="2 3" opacity={0.55} />
      <circle cx={x} cy={y} r={4.5} fill="var(--color-card)" stroke={accentColor} strokeWidth={1.6} />
      <g transform={`translate(${boxX.toFixed(2)}, ${boxY.toFixed(2)})`}>
        <rect x={0} y={0} width={boxW} height={boxH} rx={3} fill="var(--tooltip-bg)" stroke={accentColor} strokeWidth={1} opacity={0.96} />
        <text x={boxW / 2} y={12} textAnchor="middle" fill="var(--tooltip-label)" fontFamily="DM Mono, monospace" fontSize={10} letterSpacing="0.04em">{label}</text>
        <text x={boxW / 2} y={24} textAnchor="middle" fill={accentColor} fontFamily="DM Mono, monospace" fontSize={11} fontWeight={700}>{value}</text>
      </g>
    </>
  )

  if (reduced) return <g aria-hidden>{content}</g>
  return (
    <m.g aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.09 }}>
      {content}
    </m.g>
  )
}

const SR_ONLY: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/** Visually-hidden polite live region — announces the active point during keyboard scrubbing. */
export function ChartLiveRegion({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" style={SR_ONLY}>
      {message}
    </div>
  )
}
