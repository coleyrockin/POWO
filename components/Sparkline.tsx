'use client'
import { motion } from 'framer-motion'

interface Props {
  values: number[]
  color: string
  width?: number
  height?: number
  delay?: number
  smooth?: boolean
}

function buildPath(pts: { x: number; y: number }[], smooth: boolean): string {
  if (pts.length === 0) return ''
  if (pts.length === 1) return `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]
    const curr = pts[i]
    if (smooth) {
      const mx = (prev.x + curr.x) / 2
      d += ` C ${mx.toFixed(2)} ${prev.y.toFixed(2)}, ${mx.toFixed(2)} ${curr.y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`
    } else {
      d += ` L ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`
    }
  }
  return d
}

export default function Sparkline({ values, color, width = 78, height = 18, delay = 0, smooth = true }: Props) {
  if (values.length < 2) return <svg width={width} height={height} aria-hidden />

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(0.0001, max - min)
  const padY = 2
  const drawH = height - padY * 2

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * width,
    y: padY + drawH - ((v - min) / range) * drawH,
  }))

  const linePath = buildPath(pts, smooth)
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(2)} ${height} L ${pts[0].x.toFixed(2)} ${height} Z`
  const gradId = `spark-${color.replace(/[^a-z0-9]/gi, '')}-${values.length}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.42" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  )
}
