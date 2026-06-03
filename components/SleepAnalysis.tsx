'use client'
import { useRef } from 'react'
import { m } from 'framer-motion'
import SectionHeader from './SectionHeader'
import { useChartCursor } from './useChartCursor'
import { ChartLiveRegion } from './ChartCursor'
import type { SleepData } from '@/lib/types'

interface Props { sleep: SleepData }

function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}
function fmtHM(hours: number) {
  const h = Math.floor(hours)
  const mm = Math.round((hours - h) * 60)
  return `${h}h ${mm}m`
}

const GOAL_HOURS = 8

export default function SleepAnalysis({ sleep }: Props) {
  const nights = sleep.nights.filter(n => !n.isNap)
  const s = sleep.summary
  const svgRef = useRef<SVGSVGElement>(null)

  const W = 600, H = 132, PAD_X = 6, PAD_Y = 14
  const vals = nights.map(n => n.in_bed_hours)
  const dataMin = vals.length ? Math.min(...vals) : 0
  const dataMax = vals.length ? Math.max(...vals) : 0
  const yMin = Math.min(dataMin, 6.5)
  const yMax = Math.max(dataMax, GOAL_HOURS + 0.5)
  const yRange = yMax - yMin || 1
  const xFor = (i: number) => PAD_X + (nights.length <= 1 ? 0 : (i / (nights.length - 1)) * (W - PAD_X * 2))
  const yFor = (v: number) => H - PAD_Y - ((v - yMin) / yRange) * (H - PAD_Y * 2)

  const coords = nights.map((n, i) => ({ x: xFor(i), i, v: n.in_bed_hours }))
  const { activeIndex, handlers } = useChartCursor({ coords, svgRef, enabled: nights.length >= 2 })

  const longest = nights.length ? nights.reduce((a, b) => (b.in_bed_hours > a.in_bed_hours ? b : a)) : null
  const shortest = nights.length ? nights.reduce((a, b) => (b.in_bed_hours < a.in_bed_hours ? b : a)) : null

  const tiles = [
    { label: 'Avg in bed', val: s.avg_in_bed_hours.toFixed(1), unit: 'hrs / night', color: 'var(--accent-blue)' },
    { label: 'Consistency', val: '±' + s.stdev_hours.toFixed(1), unit: 'hrs stdev', color: 'var(--accent-purple)' },
    { label: 'Typical bed', val: s.typical_bedtime || '—', unit: 'lights out', color: 'var(--accent-teal)' },
    { label: 'Typical wake', val: s.typical_wake || '—', unit: 'up', color: 'var(--accent-amber)' },
  ]

  if (nights.length === 0) {
    return (
      <section id="sleep">
        <SectionHeader label="Sleep Analysis" meta="no nights tracked" />
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '18px 14px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-mid)' }}>
          {sleep.coverage_note || 'No sleep sessions in this export window.'}
        </div>
      </section>
    )
  }

  const points = nights.map((n, i) => `${xFor(i)},${yFor(n.in_bed_hours)}`).join(' ')
  const linePath = `M ${points.split(' ').join(' L ')}`
  const areaPath = `M ${xFor(0)},${H - PAD_Y} L ${points} L ${xFor(nights.length - 1)},${H - PAD_Y} Z`
  const goalY = yFor(GOAL_HOURS)

  const active = activeIndex !== null ? nights[activeIndex] : null
  const activeX = activeIndex !== null ? xFor(activeIndex) : 0
  const leftPct = (activeX / W) * 100
  const tipLeft = Math.max(14, Math.min(leftPct, 86))

  return (
    <section id="sleep">
      <SectionHeader label="Sleep Analysis" meta={`${s.nights_with_data} nights · in-bed duration`} />

      {/* Coverage note — sets expectations before the data */}
      {sleep.coverage_note && (
        <div style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--accent-amber) 13%, var(--color-card)), color-mix(in srgb, var(--accent-amber) 5%, var(--color-card)))', padding: '10px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--on-accent)', background: 'var(--accent-amber)', padding: '2px 5px', borderRadius: '2px', fontWeight: 700, letterSpacing: '0.14em', flexShrink: 0, marginTop: '1px' }}>NOTE</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-mid)', lineHeight: 1.5 }}>{sleep.coverage_note}</span>
        </div>
      )}

      {/* Summary stat strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', alignItems: 'stretch', gap: '1px', background: 'var(--color-border)', border: '1px solid var(--color-border)', borderTop: 'none' }}>
        {tiles.map(t => (
          <div key={t.label} className="powo-lift" style={{ background: 'var(--color-card)', padding: '16px 14px', minHeight: '92px', height: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.16em', color: 'var(--color-mid)', textTransform: 'uppercase', marginBottom: '4px' }}>{t.label}</div>
            <div className="powo-glow-white" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: 'var(--color-white)', lineHeight: 1 }}>{t.val}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)', marginTop: '3px' }}>{t.unit}</div>
          </div>
        ))}
      </div>

      {/* Duration trend */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '16px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase' }}>In-bed hours / night</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-faint)' }}>{fmtDate(nights[0].date)} → {fmtDate(nights[nights.length - 1].date)}</span>
        </div>

        <div style={{ position: 'relative' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            role="application"
            aria-roledescription="interactive sleep-duration chart"
            aria-label={`In-bed hours across ${nights.length} nights, averaging ${s.avg_in_bed_hours.toFixed(1)} hours${active ? `. ${fmtDate(active.date)}: ${active.in_bed_hours.toFixed(1)} hours` : '. Use arrow keys to inspect.'}`}
            {...handlers}
            style={{ width: '100%', height: '132px', display: 'block', ...handlers.style }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="sleepArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-purple)" stopOpacity="0.34" />
                <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* 8-hour goal line */}
            <line x1={PAD_X} y1={goalY} x2={W - PAD_X} y2={goalY} stroke="var(--accent-green)" strokeWidth="1" strokeDasharray="4 4" opacity={0.5} />
            <path d={areaPath} fill="url(#sleepArea)" />
            <m.path
              d={linePath}
              fill="none"
              stroke="var(--accent-purple)"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            />
            {longest && <circle cx={xFor(nights.indexOf(longest))} cy={yFor(longest.in_bed_hours)} r="3" fill="var(--accent-amber)" />}
            {shortest && <circle cx={xFor(nights.indexOf(shortest))} cy={yFor(shortest.in_bed_hours)} r="3" fill="var(--accent-coral)" />}
            {active && <circle cx={activeX} cy={yFor(active.in_bed_hours)} r="3.2" fill="var(--accent-purple)" />}
          </svg>

          {active && (
            <>
              <div aria-hidden style={{ position: 'absolute', top: 0, bottom: 0, left: `${leftPct}%`, width: '1px', background: 'var(--accent-purple)', opacity: 0.55, pointerEvents: 'none' }} />
              <div aria-hidden style={{ position: 'absolute', bottom: '100%', left: `${tipLeft}%`, transform: 'translate(-50%, -2px)', background: 'var(--tooltip-bg)', border: '1px solid var(--accent-purple)', borderRadius: '4px', padding: '4px 8px', whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.45)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-faint)' }}>{fmtDate(active.date)}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '15px', color: 'var(--accent-purple)', lineHeight: 1.1 }}>{fmtHM(active.in_bed_hours)}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)' }}>{active.bedtime_local} → {active.wake_time_local}</div>
              </div>
            </>
          )}
          <ChartLiveRegion message={active ? `${fmtDate(active.date)}: ${active.in_bed_hours.toFixed(1)} hours, ${active.bedtime_local} to ${active.wake_time_local}` : ''} />
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px', fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-mid)', letterSpacing: '0.06em' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '12px', height: '2px', background: 'var(--accent-green)', display: 'inline-block' }} /> 8h goal</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }} /> longest {longest ? fmtHM(longest.in_bed_hours) : ''}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-coral)', display: 'inline-block' }} /> shortest {shortest ? fmtHM(shortest.in_bed_hours) : ''}</span>
          {s.naps > 0 && <span>· {s.naps} nap{s.naps > 1 ? 's' : ''} excluded</span>}
        </div>
      </div>
    </section>
  )
}
