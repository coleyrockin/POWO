'use client'
import { useRef, useState } from 'react'
import { m } from 'framer-motion'
import { ACTIVITY_SVG_ICONS } from '@/lib/icons'
import type { DailyMetric, Workout } from '@/lib/types'
import SectionHeader from './SectionHeader'
import ChartCursorBar from './ChartCursorBar'
import { ChartLiveRegion } from './ChartCursor'

interface Props {
  daily: DailyMetric[]
  workouts: Workout[]
}

export default function ActivityRings({ daily, workouts }: Props) {
  const last14 = daily.slice(-14)
  const calValues = last14
    .map(d => d.active_kcal)
    .filter((cal): cal is number => cal !== null)
  const maxCal = calValues.length > 0 ? Math.max(...calValues) : 0

  // Group workouts by date
  const workoutsByDate: Record<string, string[]> = {}
  for (const w of workouts) {
    if (!workoutsByDate[w.date]) workoutsByDate[w.date] = []
    if (!workoutsByDate[w.date].includes(w.type)) {
      workoutsByDate[w.date].push(w.type)
    }
  }

  const totalCal = last14.reduce((a, d) => a + (d.active_kcal ?? 0), 0)
  const partialDays = last14.filter(d => d.active_kcal === null)

  const gridRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const idxFromClientX = (clientX: number): number | null => {
    const el = gridRef.current
    if (!el) return null
    const r = el.getBoundingClientRect()
    if (r.width === 0) return null
    const i = Math.floor(((clientX - r.left) / r.width) * last14.length)
    return Math.max(0, Math.min(last14.length - 1, i))
  }
  const active = activeIdx !== null ? last14[activeIdx] : null
  const activeWorkouts = active ? (workoutsByDate[active.date] ?? []) : []
  const activeIsPeak = active != null && active.active_kcal !== null && active.active_kcal === maxCal && maxCal > 0
  const activeLabel = active
    ? `${new Date(active.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: ${active.active_kcal === null ? 'partial data' : `${Math.round(active.active_kcal)} active kcal`}${activeWorkouts.length ? `, ${activeWorkouts.join(', ')}` : ''}`
    : ''
  const onKey = (e: React.KeyboardEvent) => {
    const last = last14.length - 1
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { setActiveIdx(p => (p === null ? 0 : Math.min(p + 1, last))); e.preventDefault() }
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { setActiveIdx(p => (p === null ? last : Math.max(p - 1, 0))); e.preventDefault() }
    else if (e.key === 'Home') { setActiveIdx(0); e.preventDefault() }
    else if (e.key === 'End') { setActiveIdx(last); e.preventDefault() }
    else if (e.key === 'Escape') { setActiveIdx(null) }
  }

  return (
    <section>
      <SectionHeader
        label="14-Day Burn"
        meta={`${Math.round(totalCal).toLocaleString()} kcal${partialDays.length > 0 ? ` · ${partialDays.length} partial` : ''}`}
      />
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderTop: 'none', padding: '20px 14px 18px' }}>
        <div
          ref={gridRef}
          className="powo-burn"
          tabIndex={0}
          role="application"
          aria-roledescription="interactive bar chart"
          aria-label={`14-day active-calorie burn, ${last14.length} days. Use arrow keys to inspect each day.${active ? ` Selected ${activeLabel}.` : ''}`}
          style={{ display: 'grid', gap: '3px', alignItems: 'flex-end', position: 'relative', touchAction: 'pan-y' }}
          onKeyDown={onKey}
          onBlur={() => setActiveIdx(null)}
          onPointerDown={e => { if (e.pointerType === 'touch') { draggingRef.current = true; try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* noop */ } const i = idxFromClientX(e.clientX); if (i !== null) setActiveIdx(i) } }}
          onPointerMove={e => { if (e.pointerType === 'touch' && draggingRef.current) { const i = idxFromClientX(e.clientX); if (i !== null) setActiveIdx(i) } }}
          onPointerUp={e => { if (e.pointerType === 'touch') { draggingRef.current = false; setActiveIdx(null) } }}
          onPointerLeave={e => { if (e.pointerType !== 'touch') setActiveIdx(null) }}
        >
          {active && (
            <ChartCursorBar
              leftPct={((activeIdx! + 0.5) / last14.length) * 100}
              label={new Date(active.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              lines={[active.active_kcal === null ? 'partial data' : `${Math.round(active.active_kcal).toLocaleString()} kcal`, activeWorkouts.length ? activeWorkouts.join(' · ') : 'no workout']}
              accentColor={activeIsPeak ? 'var(--accent-amber)' : 'var(--accent-blue)'}
            />
          )}
          {last14.map((d, i) => {
            const isPartial = d.active_kcal === null
            const cal = d.active_kcal
            const pct = maxCal > 0 && cal !== null ? cal / maxCal : 0
            const isPeak = cal !== null && cal === maxCal && cal > 0
            const dayWorkouts = workoutsByDate[d.date] ?? []
            const barHeight = Math.max(Math.round(pct * 96), 4)
            const dow = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })[0]
            const calLabel = cal === null ? 'partial active calorie data' : `${Math.round(cal).toLocaleString()} active calories`
            const workoutLabel = dayWorkouts.length > 0 ? `, workouts: ${dayWorkouts.join(', ')}` : ''

            return (
              <div
                key={d.date}
                role="img"
                aria-label={`${d.date}: ${calLabel}${workoutLabel}`}
                title={`${d.date}: ${calLabel}${workoutLabel}`}
                onPointerEnter={e => { if (e.pointerType !== 'touch') setActiveIdx(i) }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', background: activeIdx === i ? 'var(--color-raised)' : 'transparent', borderRadius: '4px' }}
              >
                {isPeak && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.7, duration: 0.3 }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.12em', color: 'var(--on-accent)', background: 'var(--accent-amber)', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}
                  >★</m.div>
                )}
                {!isPeak && <div style={{ height: '12px' }} />}

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '14px', justifyContent: 'flex-end' }}>
                  {dayWorkouts.length > 0 && (() => {
                    const Icon = ACTIVITY_SVG_ICONS[dayWorkouts[0]] ?? ACTIVITY_SVG_ICONS['Unknown Activity']
                    return <Icon size={10} color={isPeak ? 'var(--accent-amber)' : isPartial ? 'var(--color-faint)' : 'var(--color-mid)'} />
                  })()}
                </div>

                <div style={{ fontFamily: 'var(--font-display)', fontSize: isPeak ? '11px' : '10px', color: isPeak ? 'var(--accent-amber)' : isPartial ? 'var(--color-faint)' : 'var(--color-white)', textAlign: 'center', lineHeight: 1, letterSpacing: '0.5px' }}>
                  {cal === null ? '--' : cal >= 1000 ? (cal / 1000).toFixed(1) + 'k' : Math.round(cal)}
                </div>

                <div style={{ width: '100%', height: '96px', display: 'flex', alignItems: 'flex-end' }}>
                  <m.div
                    initial={{ height: 0 }} whileInView={{ height: barHeight }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: '100%', borderRadius: '3px 3px 0 0',
                      opacity: isPartial ? 0.5 : 1,
                      background: isPartial
                        ? 'repeating-linear-gradient(180deg, rgba(185,185,189,0.32) 0 3px, rgba(185,185,189,0.08) 3px 6px)'
                        : isPeak
                        ? 'linear-gradient(180deg, #ffc857 0%, var(--accent-amber) 60%, #d98e0a 100%)'
                        : `linear-gradient(180deg, rgba(80, 173, 255, ${0.45 + pct * 0.55}), rgba(10, 132, 255, ${0.35 + pct * 0.65}))`,
                      boxShadow: isPartial
                        ? 'inset 0 1px 0 rgba(255,255,255,0.08)'
                        : isPeak
                        ? '0 0 18px rgba(255, 170, 34, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                        : `0 0 10px rgba(10, 132, 255, ${0.18 + pct * 0.28}), inset 0 1px 0 rgba(255, 255, 255, 0.14)`,
                    }}
                  />
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.05em', color: isPeak ? 'var(--accent-amber)' : isPartial ? 'var(--color-faint)' : 'var(--color-mid)', textAlign: 'center', fontWeight: isPeak ? 600 : 400 }}>
                  {dow}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <ChartLiveRegion message={active ? activeLabel : ''} />
    </section>
  )
}
