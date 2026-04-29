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

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
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
    return () => observer.disconnect()
  }, [])

  const onClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 30,
        background: 'rgba(8, 8, 8, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--color-border)',
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
          padding: '8px 14px',
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
                padding: '5px 11px',
                background: isActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.04)',
                color: isActive ? 'var(--color-black)' : 'var(--color-white)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-blue)' : '#1c1c1c',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 180ms ease, color 180ms ease, border-color 180ms ease',
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
