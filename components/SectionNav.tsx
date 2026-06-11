'use client'
import { useEffect, useRef, useState } from 'react'

const SECTIONS = [
  { id: 'explore',    label: 'Explore',  tint: 'rgba(10, 132, 255, 0.20)',  tint2: 'rgba(0, 212, 170, 0.06)'  },
  { id: 'period',     label: 'Period',   tint: 'rgba(10, 132, 255, 0.20)',  tint2: 'rgba(52, 199, 89, 0.06)'  },
  { id: 'week-change',label: 'WoW',      tint: 'rgba(179, 102, 255, 0.20)', tint2: 'rgba(10, 132, 255, 0.06)' },
  { id: 'insights',   label: 'Insights', tint: 'rgba(0, 212, 170, 0.20)',   tint2: 'rgba(179, 102, 255, 0.06)' },
  { id: 'consistency',label: 'Streak',   tint: 'rgba(52, 199, 89, 0.22)',   tint2: 'rgba(0, 212, 170, 0.06)' },
  { id: 'vo2',        label: 'VO₂',      tint: 'rgba(0, 212, 170, 0.22)',   tint2: 'rgba(255, 170, 34, 0.10)' },
  { id: 'cardiac',    label: 'Cardiac',  tint: 'rgba(255, 107, 107, 0.20)', tint2: 'rgba(52, 199, 89, 0.06)'  },
  { id: 'sleep',      label: 'Sleep',    tint: 'rgba(179, 102, 255, 0.22)', tint2: 'rgba(0, 212, 170, 0.06)'  },
  { id: 'workouts',   label: 'Workouts', tint: 'rgba(255, 170, 34, 0.20)',  tint2: 'rgba(10, 132, 255, 0.06)' },
  { id: 'pushups',    label: 'Pushups',  tint: 'rgba(255, 107, 107, 0.22)', tint2: 'rgba(255, 170, 34, 0.06)' },
  { id: 'rest',       label: 'Rest',     tint: 'rgba(0, 212, 170, 0.20)',   tint2: 'rgba(179, 102, 255, 0.06)'},
  { id: 'training',   label: 'Train',    tint: 'rgba(52, 199, 89, 0.20)',   tint2: 'rgba(10, 132, 255, 0.06)' },
  { id: 'awards',     label: 'Awards',   tint: 'rgba(255, 170, 34, 0.22)',  tint2: 'rgba(255, 107, 107, 0.06)'},
  { id: 'share',      label: 'Share',    tint: 'rgba(10, 132, 255, 0.20)',  tint2: 'rgba(0, 212, 170, 0.06)' },
]

export default function SectionNav() {
  const [active, setActive] = useState<string>('')
  const stripRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const manualActiveRef = useRef<string | null>(null)
  const manualTimerRef = useRef<number | null>(null)

  const tintIdRef = useRef<string | null>(null)
  const applyTint = (id: string) => {
    if (tintIdRef.current === id) return // skip no-op writes — each one forces a full-page style recalc
    const s = SECTIONS.find(x => x.id === id)
    if (!s) return
    tintIdRef.current = id
    const root = document.documentElement
    root.style.setProperty('--ambient-tint', s.tint)
    root.style.setProperty('--ambient-tint-2', s.tint2)
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (manualActiveRef.current) {
          setActive(manualActiveRef.current)
          applyTint(manualActiveRef.current)
          return
        }
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top)
        if (visible.length > 0) {
          const id = visible[0].target.id
          setActive(id)
          applyTint(id)
          const btn = buttonsRef.current[id]
          if (btn && stripRef.current) {
            const stripRect = stripRef.current.getBoundingClientRect()
            const btnRect = btn.getBoundingClientRect()
            const offset = btnRect.left - stripRect.left + btnRect.width / 2 - stripRect.width / 2
            stripRef.current.scrollTo({ left: stripRef.current.scrollLeft + offset, behavior: 'smooth' })
          }
        }
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 }
    )
    SECTIONS.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => {
      observer.disconnect()
      if (manualTimerRef.current !== null) window.clearTimeout(manualTimerRef.current)
    }
  }, [])

  const onClick = (id: string) => {
    setActive(id)
    applyTint(id)
    manualActiveRef.current = id
    if (manualTimerRef.current !== null) window.clearTimeout(manualTimerRef.current)
    manualTimerRef.current = window.setTimeout(() => {
      if (manualActiveRef.current === id) manualActiveRef.current = null
    }, 800)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="powo-nav" aria-label="Section navigation">
      <div className="powo-nav-inner">
        <div ref={stripRef} className="powo-nav-strip no-scrollbar">
          {SECTIONS.map(s => {
            const isActive = active === s.id
            return (
              <button
                key={s.id}
                ref={el => { buttonsRef.current[s.id] = el }}
                onClick={() => onClick(s.id)}
                aria-current={isActive ? 'location' : undefined}
                className={isActive ? 'powo-nav-btn is-active' : 'powo-nav-btn'}
              >
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
