'use client'
import { useId, useState, type ReactNode } from 'react'

/**
 * Mobile-only collapse. The header stays visible; the body collapses on phones
 * (<=639px) and is always open on iPad/desktop (the media query in globals.css
 * forces grid-template-rows:1fr there and disables the toggle). SSR default is
 * `open=false` so a phone renders collapsed with no hydration flash; no-JS and
 * reduced-motion are handled by CSS guards. Height animates via the
 * grid-template-rows 0fr->1fr trick — no JS measurement, no layout-shift jank.
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
  const id = useId()
  return (
    <div className="powo-collapse" data-open={open}>
      <button
        type="button"
        className="powo-collapse-toggle"
        aria-expanded={open}
        aria-controls={id}
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
