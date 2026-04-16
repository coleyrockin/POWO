export default function Footer({ generated, week }: { generated: string, week: string }) {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', textAlign: 'center', padding: '28px 16px 32px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-mid)' }}>
        <span style={{ color: 'var(--color-wolf)', fontWeight: 500 }}>✓ Apple Health Verified</span>
        <span>Source: Apple HealthKit</span>
        <span>Generated {generated}</span>
        <span style={{ color: 'var(--color-dim)', fontSize: '9px', marginTop: '2px' }}>{week}</span>
      </div>

      <div
        style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '3px',
            color: 'var(--color-white)',
          }}
        >
          <span style={{ color: 'var(--color-wolf)' }}>PO</span>WO
        </div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            letterSpacing: '0.18em',
            color: 'var(--color-mid)',
            textTransform: 'uppercase',
          }}
        >
          Proof of Workout &nbsp;·&nbsp; Built by{' '}
          <a
            href="https://github.com/coleyrockin"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-wolf)', textDecoration: 'none' }}
          >
            @coleyrockin
          </a>
        </div>
      </div>
    </footer>
  )
}
