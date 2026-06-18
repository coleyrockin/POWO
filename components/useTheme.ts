'use client'
import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

function applyTheme(t: Theme) {
  const el = document.documentElement
  el.classList.toggle('light', t === 'light')
  el.classList.toggle('dark', t === 'dark')
}

/**
 * Reads the theme the no-flash script already applied and persists toggle
 * choices to localStorage. Default is dark; light is only reached by an
 * explicit toggle (OS preference is intentionally not followed).
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Sync with the class the no-flash script already applied (hydration-safe:
    // server + first client render are 'dark', this corrects post-mount).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
  }, [])

  const toggle = () => {
    setTheme(prev => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try { localStorage.setItem('powo-theme', next) } catch { /* private mode */ }
      return next
    })
  }

  return { theme, toggle }
}
