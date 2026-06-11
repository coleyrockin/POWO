export default function Footer({
  generated,
  period,
  through,
  partialDate,
}: {
  generated: string
  period: string
  through: string
  partialDate?: string
}) {
  const fmtDate = (iso: string) => {
    const d = new Date(iso.slice(0, 10) + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <footer style={{ textAlign: 'center', padding: '32px 16px 36px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px', fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)' }}>
        <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>✓ Apple Health Verified</span>
        <span>Source: Apple HealthKit</span>
        <span>Latest Apple Health export: {fmtDate(generated)}</span>
        <span>Through {fmtDate(`${through}T00:00:00`)}{partialDate ? ` · ${fmtDate(`${partialDate}T00:00:00`)} partial` : ''}</span>
        <span style={{ color: 'var(--color-mid)', fontSize: '11px', marginTop: '2px' }}>{period}</span>
      </div>

      <div style={{ marginTop: '28px', paddingTop: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div className="powo-wordmark" style={{ fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '4px', lineHeight: 1 }}>
          POWO
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.18em', color: 'var(--color-mid)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Proof of Workout</span>
          <span style={{ color: 'var(--color-dim)' }}>·</span>
          <span>
            Built by{' '}
            <a href="https://github.com/coleyrockin" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'inline-block', padding: '13px 6px', margin: '-13px -6px' }}>
              @coleyrockin
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}
