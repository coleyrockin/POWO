'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface for observability; replace with your logger of choice
    console.error(error)
  }, [error])

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '20px',
        color: 'var(--color-white)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--accent-coral)',
        }}
      >
        Something broke
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '56px', lineHeight: 1 }}>
        Workout interrupted
      </h1>
      <p style={{ color: 'var(--color-mid)', maxWidth: '32ch' }}>
        The data couldn&apos;t render. Refresh to try again — your streak is safe.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: '12px',
          padding: '12px 24px',
          background: 'var(--accent-blue)',
          color: 'var(--color-black)',
          border: 0,
          borderRadius: '999px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Retry
      </button>
    </main>
  )
}
