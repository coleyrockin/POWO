'use client'
import { useEffect, useRef, useState } from 'react'

const SECTIONS = [
  { id: 'period',     label: 'Period'   },
  { id: 'week-change',label: 'WoW'      },
  { id: 'vo2',        label: 'VO₂'      },
  { id: 'cardiac',    label: 'Cardiac'  },
  { id: 'sleep',      label: 'Sleep'    },
  { id: 'workouts',   label: 'Workouts' },
  { id: 'pushups',    label: 'Pushups'  },
  { id: 'rest',       label: 'Rest'     },
  { id: 'training',   label: 'Train'    },
  { id: 'awards',     label: 'Awards'   },
]

export default function SectionNav() {
  const [active, setActive] = useState<string>('')
  const stripRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<Record<string, HTMLButtonElement | null>>({})
  const manualActiveRef = useRef<string | null>(null)
  const manualTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (manualActiveRef.current) {
          setActive(manualActiveRef.current)
          return
        }
        const visible = entries.filter(e => e.isIntersecting).sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top)
        if (visible.length > 0) {
          const id = visible[0].target.id
          setActive(id)
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
    manualActiveRef.current = id
    if (manualTimerRef.current !== null) window.clearTimeout(manualTimerRef.current)
    manualTimerRef.current = window.setTimeout(() => {
      if (manualActiveRef.current === id) manualActiveRef.current = null
    }, 800)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(8, 8, 9, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.32)',
      }}
      aria-label="Section navigation"
    >
      <div
        ref={stripRef}
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          padding: '9px 14px',
          scrollSnapType: 'x mandatory',
        }}
      >
        {SECTIONS.map(s => {
          const isActive = active === s.id
          return (
            <button
              key={s.id}
              ref={el => { buttonsRef.current[s.id] = el }}
              onClick={() => onClick(s.id)}
              style={{
                flexShrink: 0,
                minHeight: '30px',
                padding: '5px 12px',
                background: isActive ? 'linear-gradient(180deg, #4ca4ff, var(--accent-blue))' : 'rgba(255,255,255,0.045)',
                color: isActive ? 'var(--color-black)' : 'var(--color-white)',
                border: '1px solid',
                borderColor: isActive ? 'rgba(76,164,255,0.95)' : 'var(--color-border)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: isActive ? '0 0 18px rgba(10,132,255,0.28), inset 0 1px 0 rgba(255,255,255,0.28)' : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 180ms ease',
                scrollSnapAlign: 'center',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
