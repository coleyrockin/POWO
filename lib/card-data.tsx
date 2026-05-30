// Shareable stat-card templates rendered by next/og (Satori).
// Satori constraints: flexbox only (no grid), explicit display:flex on
// containers, CSS custom properties don't resolve → palette hardcoded here.
import type { ReactElement } from 'react'
import type { HealthData } from '@/lib/types'
import type { WeekChangeMetric } from '@/lib/helpers'

export const CARD_SIZE = { width: 1080, height: 1080 }
export const STORY_SIZE = { width: 1080, height: 1920 }

// Font family names registered in the route's ImageResponse fonts[].
const DISPLAY = 'Bebas Neue'

const C = {
  bg: '#080808',
  white: '#f0ede6',
  mid: '#b9b9bd',
  line: '#1d1d20',
  blue: '#0a84ff',
  green: '#34c759',
  amber: '#ffaa22',
  coral: '#ff6b6b',
  teal: '#00d4aa',
  purple: '#b366ff',
}

function fmt(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function Frame({ kicker, footer, children }: { kicker: string; footer: string; children: ReactElement }): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: C.bg,
        backgroundImage: `radial-gradient(circle at 20% 0%, rgba(10,132,255,0.10), transparent 45%), radial-gradient(circle at 100% 100%, rgba(255,170,34,0.08), transparent 40%)`,
        color: C.white,
        padding: '74px 76px',
        fontFamily: 'DM Sans',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: C.green, boxShadow: `0 0 26px ${C.green}` }} />
          <div style={{ display: 'flex', fontSize: '23px', letterSpacing: '0.26em', color: C.mid, textTransform: 'uppercase' }}>Apple Health · Verified</div>
        </div>
        <div style={{ display: 'flex', fontFamily: DISPLAY, fontSize: '46px', letterSpacing: '0.06em', color: C.white }}>POWO</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', paddingTop: '30px', paddingBottom: '30px' }}>
        <div style={{ display: 'flex', fontSize: '26px', letterSpacing: '0.2em', color: C.mid, textTransform: 'uppercase', marginBottom: '40px' }}>{kicker}</div>
        {children}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '22px', color: C.mid, letterSpacing: '0.08em' }}>
        <div style={{ display: 'flex' }}>{footer}</div>
        <div style={{ display: 'flex', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Proof of Workout</div>
      </div>
    </div>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color: string }): ReactElement {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', fontFamily: DISPLAY, fontSize: '128px', lineHeight: 1, color }}>{value}</div>
      <div style={{ display: 'flex', fontSize: '27px', letterSpacing: '0.14em', color: C.mid, textTransform: 'uppercase', marginTop: '8px' }}>{label}</div>
    </div>
  )
}

export function renderOverviewCard(d: HealthData): ReactElement {
  const pushups = d.pushups.weeks.reduce((t, w) => t + w.total, 0)
  const t = d.summary.period_totals
  const stepsK = `${Math.round(t.total_steps / 1000)}K`
  const rows: { value: string; label: string; color: string }[][] = [
    [
      { value: stepsK, label: 'Steps', color: C.blue },
      { value: String(t.total_workouts), label: 'Workouts', color: C.green },
    ],
    [
      { value: d.summary.vo2_max_progression.peak.value.toFixed(1), label: 'VO₂ Peak', color: C.amber },
      { value: pushups.toLocaleString(), label: 'Pushups', color: C.coral },
    ],
  ]
  return (
    <Frame kicker={`${d.meta.period.days}-Day Snapshot`} footer={`${fmt(d.meta.period.start)} – ${fmt(d.meta.period.end)} · 2026`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            {row.map((s, j) => (
              <Stat key={j} value={s.value} label={s.label} color={s.color} />
            ))}
          </div>
        ))}
      </div>
    </Frame>
  )
}

export function renderWeekCard(d: HealthData, wc: WeekChangeMetric[]): ReactElement {
  const last7 = d.daily.slice(-7)
  const range = `${fmt(last7[0].date)} – ${fmt(last7[last7.length - 1].date)}`
  const fmtVal = (m: WeekChangeMetric): string => {
    if (m.current === null) return '—'
    if (m.label === 'RHR' || m.label === 'HRV') return String(Math.round(m.current))
    return Math.round(m.current).toLocaleString()
  }
  const deltaColor = (m: WeekChangeMetric): string => {
    if (m.deltaPct === null) return C.mid
    const improving = (m.goodDirection === 'up' && m.deltaPct >= 0) || (m.goodDirection === 'down' && m.deltaPct <= 0)
    return improving ? C.green : C.coral
  }
  return (
    <Frame kicker="This Week" footer={range}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {wc.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: `1px solid ${C.line}`, paddingBottom: '24px' }}>
            <div style={{ display: 'flex', fontSize: '36px', color: C.white }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
              <div style={{ display: 'flex', fontFamily: DISPLAY, fontSize: '52px', color: C.white }}>{fmtVal(m)}</div>
              <div style={{ display: 'flex', fontSize: '30px', color: deltaColor(m), paddingBottom: '6px' }}>
                {m.deltaPct === null ? '—' : `${m.deltaPct >= 0 ? '+' : '-'}${Math.abs(m.deltaPct).toFixed(0)}%`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

export function renderActivityCard(d: HealthData): ReactElement {
  const colors = [C.blue, C.green, C.amber, C.coral, C.teal, C.purple]
  const top = [...d.workout_summary].sort((a, b) => b.total_calories - a.total_calories).slice(0, 6)
  return (
    <Frame kicker={`By Activity · ${d.summary.period_totals.total_workouts} sessions`} footer={`${fmt(d.meta.period.start)} – ${fmt(d.meta.period.end)} · 2026`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
        {top.map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${C.line}`, paddingBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: colors[i % colors.length] }} />
              <div style={{ display: 'flex', fontSize: '38px', color: C.white }}>{w.type}</div>
            </div>
            <div style={{ display: 'flex', fontSize: '26px', color: C.mid, letterSpacing: '0.04em' }}>
              {w.sessions}× · {Math.round(w.total_duration_min / 60)}h · {Math.round(w.total_calories).toLocaleString()} kcal
            </div>
          </div>
        ))}
      </div>
    </Frame>
  )
}

// Vertical 1080×1920 poster for Instagram / TikTok stories.
export function renderStoryCard(d: HealthData): ReactElement {
  const pushups = d.pushups.weeks.reduce((t, w) => t + w.total, 0)
  const t = d.summary.period_totals
  const stats = [
    { value: `${Math.round(t.total_steps / 1000)}K`, label: 'Steps', color: C.blue },
    { value: String(t.total_workouts), label: 'Workouts', color: C.green },
    { value: d.summary.vo2_max_progression.peak.value.toFixed(1), label: 'VO₂ Peak', color: C.amber },
    { value: pushups.toLocaleString(), label: 'Pushups', color: C.coral },
  ]
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: C.bg,
        backgroundImage: `radial-gradient(circle at 15% 5%, rgba(10,132,255,0.12), transparent 40%), radial-gradient(circle at 100% 100%, rgba(255,170,34,0.10), transparent 38%)`,
        color: C.white,
        padding: '120px 96px',
        fontFamily: 'DM Sans',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: C.green, boxShadow: `0 0 30px ${C.green}` }} />
        <div style={{ display: 'flex', fontSize: '28px', letterSpacing: '0.26em', color: C.mid, textTransform: 'uppercase' }}>Apple Health · Verified</div>
      </div>

      <div style={{ display: 'flex', fontFamily: DISPLAY, fontSize: '300px', lineHeight: 0.86, letterSpacing: '0.02em', color: C.white, marginTop: '56px' }}>POWO</div>
      <div style={{ display: 'flex', fontSize: '34px', letterSpacing: '0.16em', color: C.mid, textTransform: 'uppercase', marginTop: '12px' }}>{d.meta.period.days}-Day Snapshot</div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '44px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', borderBottom: `1px solid ${C.line}`, paddingBottom: '28px' }}>
            <div style={{ display: 'flex', fontFamily: DISPLAY, fontSize: '168px', lineHeight: 0.8, color: s.color }}>{s.value}</div>
            <div style={{ display: 'flex', fontSize: '38px', letterSpacing: '0.14em', textTransform: 'uppercase', color: C.mid }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '28px', color: C.mid, letterSpacing: '0.08em' }}>
        <div style={{ display: 'flex' }}>{fmt(d.meta.period.start)} – {fmt(d.meta.period.end)} · 2026</div>
        <div style={{ display: 'flex', letterSpacing: '0.18em', textTransform: 'uppercase' }}>Proof of Workout</div>
      </div>
    </div>
  )
}
