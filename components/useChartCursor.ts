'use client'
import { useCallback, useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent, RefObject } from 'react'

interface Options<T extends { x: number }> {
  /** Data points carrying an `x` in SVG user units, sorted ascending by x. */
  coords: T[]
  /** Ref to the chart's <svg> element (needs getScreenCTM for the coord transform). */
  svgRef: RefObject<SVGSVGElement | null>
  /** When false, the hook is inert (no handlers fire, index stays null). */
  enabled?: boolean
}

interface CursorHandlers {
  onPointerMove: (e: PointerEvent<SVGSVGElement>) => void
  onPointerDown: (e: PointerEvent<SVGSVGElement>) => void
  onPointerUp: (e: PointerEvent<SVGSVGElement>) => void
  onPointerLeave: (e: PointerEvent<SVGSVGElement>) => void
  onKeyDown: (e: KeyboardEvent<SVGSVGElement>) => void
  onBlur: () => void
  tabIndex: number
  style: { touchAction: 'pan-y'; cursor: 'crosshair' }
}

export interface ChartCursorState {
  activeIndex: number | null
  handlers: CursorHandlers
}

/** Binary search for the data point whose x is nearest to `svgX`. coords must be x-sorted. */
function nearestIndex(coords: { x: number }[], svgX: number): number {
  let lo = 0
  let hi = coords.length - 1
  if (hi <= 0) return 0
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (coords[mid].x < svgX) lo = mid + 1
    else hi = mid
  }
  if (lo > 0) {
    const left = Math.abs(coords[lo - 1].x - svgX)
    const right = Math.abs(coords[lo].x - svgX)
    return left <= right ? lo - 1 : lo
  }
  return lo
}

/**
 * Headless interaction layer for SVG charts: maps pointer/touch x → nearest data
 * point and exposes keyboard scrubbing. Convert client px → SVG user units with
 * getScreenCTM so it's correct under responsive scaling and preserveAspectRatio="none".
 */
export function useChartCursor<T extends { x: number }>({ coords, svgRef, enabled = true }: Options<T>): ChartCursorState {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const draggingRef = useRef(false)

  const updateFromClientX = useCallback((clientX: number) => {
    const svg = svgRef.current
    if (!svg || coords.length === 0) return
    const ctm = svg.getScreenCTM()
    if (!ctm || ctm.a === 0) return
    const svgX = (clientX - ctm.e) / ctm.a
    setActiveIndex(nearestIndex(coords, svgX))
  }, [coords, svgRef])

  const onPointerMove = useCallback((e: PointerEvent<SVGSVGElement>) => {
    if (!enabled) return
    // On touch, only scrub while the finger is down (after onPointerDown captured it).
    if (e.pointerType === 'touch' && !draggingRef.current) return
    updateFromClientX(e.clientX)
  }, [enabled, updateFromClientX])

  const onPointerDown = useCallback((e: PointerEvent<SVGSVGElement>) => {
    if (!enabled) return
    if (e.pointerType === 'touch') {
      draggingRef.current = true
      try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* not capturable */ }
    }
    updateFromClientX(e.clientX)
  }, [enabled, updateFromClientX])

  const onPointerUp = useCallback((e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType === 'touch') {
      draggingRef.current = false
      setActiveIndex(null)
    }
  }, [])

  const onPointerLeave = useCallback((e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== 'touch') setActiveIndex(null)
  }, [])

  const onKeyDown = useCallback((e: KeyboardEvent<SVGSVGElement>) => {
    if (!enabled || coords.length === 0) return
    const last = coords.length - 1
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        setActiveIndex(prev => (prev === null ? 0 : Math.min(prev + 1, last)))
        e.preventDefault()
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        setActiveIndex(prev => (prev === null ? last : Math.max(prev - 1, 0)))
        e.preventDefault()
        break
      case 'Home':
        setActiveIndex(0)
        e.preventDefault()
        break
      case 'End':
        setActiveIndex(last)
        e.preventDefault()
        break
      case 'Escape':
        setActiveIndex(null)
        break
    }
  }, [enabled, coords.length])

  const onBlur = useCallback(() => setActiveIndex(null), [])

  return {
    activeIndex: enabled ? activeIndex : null,
    handlers: {
      onPointerMove,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onKeyDown,
      onBlur,
      tabIndex: enabled ? 0 : -1,
      style: { touchAction: 'pan-y', cursor: 'crosshair' },
    },
  }
}
