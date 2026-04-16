export default function Footer({ generated, week }: { generated: string, week: string }) {
  return (
    <footer style={{ borderTop: '1px solid var(--color-border)', textAlign: 'center', padding: '32px 24px' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-mid)' }}>
        <span style={{ color: 'var(--color-wolf)', fontWeight: 500 }}>✓ Apple Health</span>
        <span>·</span>
        <span>Source: Apple HealthKit</span>
        <span>·</span>
        <span>Generated {generated}</span>
      </div>
      <div style={{ marginTop: '8px', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-dim)' }}>
        {week}
      </div>
    </footer>
  )
}
