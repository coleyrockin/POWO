'use client'
import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

interface Props {
  value: number
  duration?: number
  decimals?: number
  format?: (n: number) => string
  className?: string
  style?: React.CSSProperties
  suffix?: string
  prefix?: string
}

// Eases 0→1 into a nice deceleration
const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

export default function CountUp({
  value,
  duration = 1200,
  decimals = 0,
  format,
  className,
  style,
  suffix = '',
  prefix = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return
    const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      const frame = requestAnimationFrame(() => setDisplay(value))
      return () => cancelAnimationFrame(frame)
    }
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      setDisplay(value * easeOutQuart(t))
      if (t < 1) frame = requestAnimationFrame(tick)
      else setDisplay(value)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration])

  const formatted = format
    ? format(display)
    : display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
