'use client'
import { useEffect, useId, useState, type ReactNode } from 'react'

/**
 * Mobile-only collapse. The header stays visible; the body collapses on phones
 * (<=639px) and is always open on iPad/desktop (the media query in globals.css
 * forces grid-template-rows:1fr there and disables the toggle). SSR default is
 * `open=false` so a phone renders collapsed with no hydration flash; no-JS and
 * reduced-motion are handled by CSS guards. Height animates via the
 * grid-template-rows 0fr->1fr trick — no JS measurement, no layout-shift jank.
 *
 * On desktop the toggle is inert (CSS pointer-events:none), so it's also removed
 * from the keyboard tab order (tabIndex -1) and reports expanded — otherwise it
 * would be a focusable control that does nothing. The header text stays in the
 * a11y tree either way (it's real content on desktop, not just a toggle).
 */
export default function Collapsible({
  header,
  children,
  defaultOpen = false,
}: {
  header: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [desktop, setDesktop] = useState(false) // false on SSR + first paint → no hydration mismatch
  const id = useId()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const sync = () => setDesktop(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <div className="powo-collapse" data-open={open}>
      <button
        type="button"
        className="powo-collapse-toggle"
        aria-expanded={desktop ? true : open}
        aria-controls={id}
        tabIndex={desktop ? -1 : undefined}
        onClick={() => setOpen(o => !o)}
      >
        <span className="powo-collapse-head">{header}</span>
        <span className="powo-collapse-chevron" aria-hidden>▾</span>
      </button>
      <div className="powo-collapse-body" id={id}>
        <div>{children}</div>
      </div>
    </div>
  )
}
