import Link from 'next/link'

export default function NotFound() {
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
          color: 'var(--accent-amber)',
        }}
      >
        404 · Off route
      </div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '56px', lineHeight: 1 }}>
        This page took a rest day
      </h1>
      <p style={{ color: 'var(--color-mid)', maxWidth: '32ch' }}>
        Nothing here. Head back to the dashboard.
      </p>
      <Link
        href="/"
        style={{
          marginTop: '12px',
          padding: '12px 24px',
          background: 'var(--accent-blue)',
          color: 'var(--color-black)',
          borderRadius: '999px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          textDecoration: 'none',
        }}
      >
        Back to POWO
      </Link>
    </main>
  )
}
