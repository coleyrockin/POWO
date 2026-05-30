'use client'
import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

function applyTheme(t: Theme) {
  const el = document.documentElement
  el.classList.toggle('light', t === 'light')
  el.classList.toggle('dark', t === 'dark')
}

/**
 * Reads the theme the no-flash script already applied, follows system changes
 * until the user makes an explicit choice, and persists choices to localStorage.
 * Mirrors the matchMedia + change-listener pattern used in ConsistencyHeatmap.
 */
export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    // Sync with the class the no-flash script already applied (hydration-safe:
    // server + first client render are 'dark', this corrects post-mount).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.classList.contains('light') ? 'light' : 'dark')
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      if (localStorage.getItem('powo-theme')) return // user override wins
      const sys: Theme = mq.matches ? 'light' : 'dark'
      setTheme(sys)
      applyTheme(sys)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
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
