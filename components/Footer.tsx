export default function Footer({ generated, period }: { generated: string; period: string }) {
  const fmtDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', textAlign: 'center', padding: '32px 16px 36px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)' }}>
        <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>✓ Apple Health Verified</span>
        <span>Source: Apple HealthKit</span>
        <span>Generated {fmtDate(generated)}</span>
        <span style={{ color: 'var(--color-mid)', fontSize: '11px', marginTop: '2px' }}>{period}</span>
      </div>

      <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '4px', color: 'var(--color-white)', lineHeight: 1 }}>
          <span style={{ color: 'var(--accent-blue)' }}>PO</span>WO
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Proof of Workout</span>
          <span style={{ color: 'var(--color-dim)' }}>·</span>
          <span>
            Built by{' '}
            <a href="https://github.com/coleyrockin" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>
              @coleyrockin
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
