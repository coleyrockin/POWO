'use client'

interface Props {
  /** Horizontal center of the active column/row, as a percent of the relative container. */
  leftPct: number
  /** Small header line (e.g. the date). */
  label: string
  /** Value lines; the first is accent-colored, the rest white. */
  lines: string[]
  accentColor: string
}

/**
 * Floating tooltip for DOM-based charts (bars, stacked rows) that have no SVG
 * coordinate system. The host wraps its chart area in a `position: relative`
 * container; this pill is rendered conditionally and follows the active column.
 */
export default function ChartCursorBar({ leftPct, label, lines, accentColor }: Props) {
  const clamped = Math.max(8, Math.min(leftPct, 92))
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: 2,
        left: `${clamped}%`,
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 6,
        background: 'var(--tooltip-bg)',
        border: `1px solid ${accentColor}`,
        borderRadius: 4,
        padding: '5px 8px',
        whiteSpace: 'nowrap',
        boxShadow: '0 6px 18px rgba(0,0,0,0.55)',
        textAlign: 'center',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: 'var(--tooltip-label)', textTransform: 'uppercase' }}>{label}</div>
      {lines.map((ln, i) => (
        <div
          key={i}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: i === 0 ? accentColor : 'var(--tooltip-fg)', marginTop: i === 0 ? 1 : 0 }}
        >
          {ln}
        </div>
      ))}
    </div>
  )
}
