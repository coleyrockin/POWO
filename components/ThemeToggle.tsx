'use client'
import { useTheme } from './useTheme'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const next = theme === 'dark' ? 'light' : 'dark'
  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '16px',
        zIndex: 10000,
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: 'var(--color-card)',
        border: '1px solid var(--color-dim)',
        color: 'var(--color-white)',
        boxShadow: 'var(--shadow-card)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        lineHeight: 1,
      }}
    >
      <span aria-hidden>{theme === 'dark' ? '☀' : '☾'}</span>
    </button>
  )
}
