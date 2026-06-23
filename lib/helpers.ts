// lib/helpers.ts — derived stats, signal analysis, recommendation engine
import type { ActivityBucket, ConsistencyResult, DailyMetric, DayConsistency, HealthData, VO2Point, Workout, SleepNight } from './types'

// ─── Visual helpers ──────────────────────────────────────────────
export function glowClassForAccent(color: string): string {
  switch (color) {
    case 'var(--accent-blue)':   return 'powo-glow-blue'
    case 'var(--accent-green)':  return 'powo-glow-green'
    case 'var(--accent-amber)':  return 'powo-glow-amber'
    case 'var(--accent-coral)':  return 'powo-glow-coral'
    case 'var(--accent-purple)': return 'powo-glow-purple'
    case 'var(--accent-teal)':   return 'powo-glow-teal'
    default:                     return ''
  }
}

// ─── Date helpers ────────────────────────────────────────────────
export function fmtShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

// ─── Slicing ─────────────────────────────────────────────────────
export function lastNDays(daily: DailyMetric[], n: number): DailyMetric[] {
  return daily.slice(-n)
}

// ─── Stats helpers (null-safe) ───────────────────────────────────
export function avg(values: (number | null | undefined)[]): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number')
  if (xs.length === 0) return null
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

export function sum(values: (number | null | undefined)[]): number {
  return values.filter((v): v is number => typeof v === 'number').reduce((a, b) => a + b, 0)
}

export function maxOf(values: (number | null | undefined)[]): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number')
  if (xs.length === 0) return null
  return Math.max(...xs)
}

export function minOf(values: (number | null | undefined)[]): number | null {
  const xs = values.filter((v): v is number => typeof v === 'number')
  if (xs.length === 0) return null
  return Math.min(...xs)
}

// Linear regression slope (per index unit). Used for trend direction.
export function trendSlope(values: (number | null)[]): number {
  const pts = values
    .map((v, i) => (typeof v === 'number' ? [i, v] as const : null))
    .filter((p): p is readonly [number, number] => p !== null)
  if (pts.length < 2) return 0
  const n = pts.length
  const meanX = pts.reduce((a, [x]) => a + x, 0) / n
  const meanY = pts.reduce((a, [, y]) => a + y, 0) / n
  let num = 0, den = 0
  for (const [x, y] of pts) {
    num += (x - meanX) * (y - meanY)
    den += (x - meanX) ** 2
  }
  return den === 0 ? 0 : num / den
}

// ─── VO2 max signals ─────────────────────────────────────────────
export function vo2Recent(vo2: VO2Point[]): { peak: VO2Point; current: VO2Point; deltaFromPeak: number; deltaPct: number } {
  if (vo2.length === 0) {
    const zero: VO2Point = { date: '', value: 0 }
    return { peak: zero, current: zero, deltaFromPeak: 0, deltaPct: 0 }
  }
  const peak = vo2.reduce((a, b) => (b.value > a.value ? b : a))
  const current = vo2[vo2.length - 1]
  const deltaFromPeak = current.value - peak.value
  const deltaPct = (deltaFromPeak / peak.value) * 100
  return { peak, current, deltaFromPeak, deltaPct }
}

// ─── Week-over-week comparison (last 7d vs prior 7d) ─────────────
export interface WeekChangeMetric {
  label: string
  current: number | null
  prior: number | null
  unit: string
  deltaPct: number | null
  goodDirection: 'up' | 'down' | 'neutral'
}

export function buildWeekChange(daily: DailyMetric[]): WeekChangeMetric[] {
  const last7 = daily.slice(-7)
  const prev7 = daily.slice(-14, -7)
  const stat = (vals: (number | null | undefined)[], reducer: 'sum' | 'avg') =>
    reducer === 'sum' ? sum(vals) : avg(vals)
  const pct = (cur: number | null, pri: number | null): number | null =>
    cur !== null && pri !== null && pri !== 0 ? ((cur - pri) / pri) * 100 : null

  const stepsCur = stat(last7.map(d => d.steps), 'sum') as number
  const stepsPri = stat(prev7.map(d => d.steps), 'sum') as number
  const kcalCur = stat(last7.map(d => d.active_kcal), 'sum') as number
  const kcalPri = stat(prev7.map(d => d.active_kcal), 'sum') as number
  const exMinCur = stat(last7.map(d => d.exercise_min), 'sum') as number
  const exMinPri = stat(prev7.map(d => d.exercise_min), 'sum') as number
  const rhrCur = stat(last7.map(d => d.resting_hr), 'avg')
  const rhrPri = stat(prev7.map(d => d.resting_hr), 'avg')
  const hrvCur = stat(last7.map(d => d.hrv_ms), 'avg')
  const hrvPri = stat(prev7.map(d => d.hrv_ms), 'avg')

  return [
    { label: 'Steps',     current: stepsCur, prior: stepsPri, unit: 'total',  deltaPct: pct(stepsCur, stepsPri),  goodDirection: 'up'      },
    { label: 'Active kcal', current: kcalCur, prior: kcalPri, unit: 'total',   deltaPct: pct(kcalCur, kcalPri),  goodDirection: 'up'      },
    { label: 'Exercise min', current: exMinCur, prior: exMinPri, unit: 'total', deltaPct: pct(exMinCur, exMinPri), goodDirection: 'up'    },
    { label: 'RHR',       current: rhrCur,   prior: rhrPri,   unit: 'avg bpm', deltaPct: pct(rhrCur, rhrPri),    goodDirection: 'down'    },
    { label: 'HRV',       current: hrvCur,   prior: hrvPri,   unit: 'avg ms',  deltaPct: pct(hrvCur, hrvPri),    goodDirection: 'up'      },
  ]
}

// ─── Weekly aggregates (ISO Mon-Sun) ─────────────────────────────
export interface WeeklyAggregate {
  weekStart: string
  weekEnd: string
  daysCovered: number
  steps: number
  activeKcal: number
  exerciseMin: number
  workouts: number
  rhrAvg: number | null
  hrvAvg: number | null
}

function isoMonday(iso: string): Date {
  const d = new Date(iso + 'T00:00:00')
  const day = d.getDay() // 0=Sun..6=Sat
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return d
}

export function buildWeeklyAggregates(data: HealthData): WeeklyAggregate[] {
  const groups = new Map<string, DailyMetric[]>()
  for (const day of data.daily) {
    const monday = isoMonday(day.date)
    const key = monday.toISOString().slice(0, 10)
    const arr = groups.get(key) ?? []
    arr.push(day)
    groups.set(key, arr)
  }
  const workoutsByDate = new Map<string, number>()
  for (const w of data.workouts) {
    workoutsByDate.set(w.date, (workoutsByDate.get(w.date) ?? 0) + 1)
  }
  const out: WeeklyAggregate[] = []
  const sortedKeys = [...groups.keys()].sort()
  for (const k of sortedKeys) {
    const days = groups.get(k) ?? []
    const start = new Date(k + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + 6)
    const ws = days.reduce((a, d) => a + d.steps, 0)
    const wkc = days.reduce((a, d) => a + (d.active_kcal ?? 0), 0)
    const wex = days.reduce((a, d) => a + (d.exercise_min ?? 0), 0)
    const wow = days.reduce((a, d) => a + (workoutsByDate.get(d.date) ?? 0), 0)
    out.push({
      weekStart: k,
      weekEnd: end.toISOString().slice(0, 10),
      daysCovered: days.length,
      steps: ws,
      activeKcal: wkc,
      exerciseMin: wex,
      workouts: wow,
      rhrAvg: avg(days.map(d => d.resting_hr)),
      hrvAvg: avg(days.map(d => d.hrv_ms)),
    })
  }
  return out
}

// ─── Recovery signals ────────────────────────────────────────────
export interface RecoverySignals {
  rhrRecent: number | null
  rhrBaseline: number
  rhrDelta: number | null
  hrvRecent: number | null
  hrvBaseline: number
  hrvDelta: number | null
  walkingHrRecent: number | null
  walkingHrPeak: number | null
  vo2Trend: 'rising' | 'stable' | 'declining'
  vo2DeltaPct: number
  loadTrend: 'rising' | 'stable' | 'declining'
  loadDeltaMin: number  // exerciseMinRecent - exerciseMinPrior (negative = de-loading)
  exerciseMinRecent: number
  exerciseMinPrior: number
  fatigueScore: number // 0-100, higher = more fatigued
}

export function analyzeRecovery(data: HealthData): RecoverySignals {
  const last7 = lastNDays(data.daily, 7)
  const prev7 = data.daily.slice(-14, -7)

  const rhrRecent = avg(last7.map(d => d.resting_hr))
  const rhrBaseline = data.summary.averages.avg_resting_hr
  const rhrDelta = rhrRecent !== null ? rhrRecent - rhrBaseline : null

  const hrvRecent = avg(last7.map(d => d.hrv_ms))
  const hrvBaseline = data.summary.averages.avg_hrv_ms
  const hrvDelta = hrvRecent !== null ? hrvRecent - hrvBaseline : null

  const walkingHrRecent = avg(last7.map(d => d.walking_hr))
  const walkingHrPeak = maxOf(last7.map(d => d.walking_hr))

  const { peak, current, deltaPct } = vo2Recent(data.vo2_max)
  const vo2Trend: 'rising' | 'stable' | 'declining' =
    deltaPct < -2 ? 'declining' : deltaPct > 1 ? 'rising' : 'stable'

  const exerciseMinRecent = sum(last7.map(d => d.exercise_min))
  const exerciseMinPrior = sum(prev7.map(d => d.exercise_min))
  const loadTrend: 'rising' | 'stable' | 'declining' =
    exerciseMinRecent > exerciseMinPrior * 1.1 ? 'rising'
      : exerciseMinRecent < exerciseMinPrior * 0.9 ? 'declining'
      : 'stable'

  // Fatigue score: composite of RHR↑, HRV↓, VO2↓, walkingHR↑
  let fatigueScore = 0
  if (rhrDelta !== null && rhrDelta > 0) fatigueScore += Math.min(rhrDelta * 6, 30)
  if (hrvDelta !== null && hrvDelta < 0) fatigueScore += Math.min(-hrvDelta * 1.5, 25)
  if (deltaPct < 0) fatigueScore += Math.min(-deltaPct * 4, 30)
  if (walkingHrRecent !== null && walkingHrRecent > 130) fatigueScore += Math.min((walkingHrRecent - 130) * 1.2, 15)
  fatigueScore = Math.round(Math.min(fatigueScore, 100))
  // Ensure VO2 alone reflected (peak referenced)
  void peak; void current

  return {
    rhrRecent, rhrBaseline, rhrDelta,
    hrvRecent, hrvBaseline, hrvDelta,
    walkingHrRecent, walkingHrPeak,
    vo2Trend, vo2DeltaPct: deltaPct,
    loadTrend, loadDeltaMin: exerciseMinRecent - exerciseMinPrior,
    exerciseMinRecent, exerciseMinPrior,
    fatigueScore,
  }
}

// ─── Sleep signals ───────────────────────────────────────────────
export interface SleepSignals {
  avgHours: number
  variability: number
  consistency: 'tight' | 'moderate' | 'erratic'
  typicalBedtime: string
  bestNight: SleepNight
  worstNight: SleepNight
}

export function analyzeSleep(data: HealthData): SleepSignals {
  const s = data.sleep.summary
  const nights = data.sleep.nights.filter(n => !n.isNap)
  const emptyNight: SleepNight = { date: '', in_bed_hours: 0, bedtime_local: '', wake_time_local: '', isNap: false }
  const bestNight = nights.length ? nights.reduce((a, b) => (b.in_bed_hours > a.in_bed_hours ? b : a)) : emptyNight
  const worstNight = nights.length ? nights.reduce((a, b) => (b.in_bed_hours < a.in_bed_hours ? b : a)) : emptyNight
  const consistency: 'tight' | 'moderate' | 'erratic' =
    s.stdev_hours < 0.7 ? 'tight' : s.stdev_hours < 1.2 ? 'moderate' : 'erratic'
  return {
    avgHours: s.avg_in_bed_hours,
    variability: s.stdev_hours,
    consistency,
    typicalBedtime: s.typical_bedtime,
    bestNight, worstNight,
  }
}

// ─── Recommendation engine ───────────────────────────────────────
export interface ReturnCriterion {
  label: string
  target: string
  current: string
  met: boolean
}

export interface RestRecommendation {
  status: 'recover' | 'taper' | 'maintain' | 'push'
  headline: string
  rationale: string
  durationDays: number
  daily_protocol: { label: string; detail: string }[]
  do: string[]
  avoid: string[]
  return_criteria: ReturnCriterion[]
}

export function buildRestRecommendation(data: HealthData): RestRecommendation {
  const r = analyzeRecovery(data)
  const s = analyzeSleep(data)

  const status: RestRecommendation['status'] =
    r.fatigueScore >= 50 ? 'recover'
      : r.fatigueScore >= 30 ? 'taper'
      : r.fatigueScore >= 15 ? 'maintain'
      : 'push'

  const headlineMap = {
    recover: 'Pull the throttle — 3 days deep recovery',
    taper: 'Taper week — cut volume 40%',
    maintain: 'Hold pace — recovery is on track',
    push: 'Green light — stack a hard week',
  }
  const durationMap = { recover: 3, taper: 5, maintain: 0, push: 0 }

  const reasons: string[] = []
  if (r.vo2DeltaPct < -2) reasons.push(`VO₂ max ${r.vo2DeltaPct.toFixed(1)}% off peak`)
  if (r.rhrDelta !== null && r.rhrDelta > 3) reasons.push(`RHR +${r.rhrDelta.toFixed(1)} bpm above ${data.meta.period.days}-day baseline`)
  if (r.hrvDelta !== null && r.hrvDelta < -5) reasons.push(`HRV ${r.hrvDelta.toFixed(1)} ms below baseline`)
  if (r.walkingHrRecent && r.walkingHrRecent > 130) reasons.push(`Walking HR ${r.walkingHrRecent.toFixed(0)} bpm — elevated`)
  if (s.avgHours > 0 && s.avgHours < 7) reasons.push(`Sleep avg ${s.avgHours.toFixed(1)}h — below 7h`)
  if (s.consistency === 'erratic') reasons.push(`Sleep timing erratic (±${s.variability.toFixed(1)}h)`)
  if (data.profile.current_constraints.length > 0) reasons.push(`Active constraints: ${data.profile.current_constraints.length} flagged`)

  const rationale = reasons.length > 0
    ? reasons.join(' · ')
    : 'All recovery signals nominal.'

  const daily_protocol = [
    { label: 'Sleep window',  detail: '10:30 PM in / 7:00 AM up — protect deep sleep block before midnight' },
    { label: 'Hydration',     detail: '100 oz water + electrolytes (sodium, potassium, magnesium)' },
    { label: 'Protein',       detail: `${Math.round(data.profile.weight_lbs * 0.9)} g/day — split across 4 feedings` },
    { label: 'Mobility',      detail: '15 min: shoulder CARs, thoracic openers, 90/90 hip series' },
    { label: 'Sun + steps',   detail: '20 min daylight walk before noon (Z1 only — keep HR < 110)' },
    { label: 'Wind-down',     detail: 'No screens 45 min pre-sleep · room ≤ 67°F · cold rinse 30 s' },
  ]

  const doList = [
    'Walking — Z1/Z2 only (sub-110 bpm)',
    'Yoga or 15-min mobility flow daily',
    'Light pickleball drills (no hard rallies)',
    'Foam roll: lats, pecs, glutes, TFL',
    'Box breathing 5 min before bed',
  ]
  const avoidList = [
    'Loaded pressing (left shoulder internal rotation pain)',
    'High-intensity pickleball games / sprint pickleball',
    'Heavy pushup volume — shoulders flagged this week',
    'Caffeine after 1 PM',
    'Alcohol on consecutive nights',
  ]
  // Living checklist — evaluate each criterion against the latest data
  const last3 = data.daily.slice(-3)
  const last2 = data.daily.slice(-2)
  const rhrTarget = Math.round(r.rhrBaseline)
  const last2Rhr = last2.map(d => d.resting_hr).filter((x): x is number => x !== null)
  const rhrMet = last2Rhr.length === 2 && last2Rhr.every(v => v <= rhrTarget)
  const last3Hrv = last3.map(d => d.hrv_ms).filter((x): x is number => x !== null)
  const hrvSlope = trendSlope(last3Hrv)
  const hrvMet = hrvSlope > 0
  const shoulderMet = false // user-reported flag, no objective measure
  const last2Nights = data.sleep.nights.filter(n => !n.isNap).slice(-2).map(n => n.in_bed_hours)
  const sleepMet = last2Nights.length === 2 && last2Nights.every(h => h >= 7.5)

  const return_criteria: ReturnCriterion[] = [
    {
      label: 'RHR back ≤ baseline · 2 mornings',
      target: `≤ ${rhrTarget} bpm`,
      current: last2Rhr.length > 0 ? `last 2: ${last2Rhr.map(v => v).join(', ')} bpm` : 'no data',
      met: rhrMet,
    },
    {
      label: 'HRV trending up · last 3 days',
      target: 'positive slope',
      current: last3Hrv.length > 0 ? `slope ${hrvSlope > 0 ? '+' : ''}${hrvSlope.toFixed(1)} ms/day` : 'no data',
      met: hrvMet,
    },
    {
      label: 'Shoulder pain-free · internal rotation test',
      target: 'self-reported clear',
      current: data.profile.current_constraints.find(c => c.includes('shoulder')) ? 'still flagged' : 'cleared',
      met: shoulderMet,
    },
    {
      label: 'Sleep ≥ 7.5 h · 2 nights running',
      target: '≥ 7.5 h in bed',
      current: last2Nights.length > 0 ? `last 2: ${last2Nights.map(h => h.toFixed(1)).join(', ')} h` : 'gap in data',
      met: sleepMet,
    },
  ]

  return { status, headline: headlineMap[status], rationale, durationDays: durationMap[status], daily_protocol, do: doList, avoid: avoidList, return_criteria }
}

// ─── Consistency / streaks ───────────────────────────────────────
// A day counts as "active" if it clears either floor. Period averages are
// ~71 exercise min / ~803 active kcal, so 20 min OR 400 kcal is a generous
// floor that still catches watch-logged days where one signal is missing.
const ACTIVE_KCAL_THRESHOLD = 400
const EXERCISE_MIN_THRESHOLD = 20

function kcalBucket(kcal: number | null): ActivityBucket | null {
  if (kcal === null) return null
  if (kcal < ACTIVE_KCAL_THRESHOLD) return 0
  if (kcal < 700) return 1
  if (kcal < 1000) return 2
  if (kcal < 1500) return 3
  return 4
}

function minBucket(min: number | null): ActivityBucket | null {
  if (min === null) return null
  if (min < EXERCISE_MIN_THRESHOLD) return 0
  if (min < 45) return 1
  if (min < 75) return 2
  if (min < 120) return 3
  return 4
}

/**
 * GitHub-style activity buckets + streak math over the daily series.
 * Partial days (both active_kcal and exercise_min null) are transparent: they
 * neither extend nor break a streak. The streak is computed in array order.
 */
export function buildConsistency(daily: DailyMetric[], workouts: Workout[]): ConsistencyResult {
  const workoutCountByDate = new Map<string, number>()
  for (const w of workouts) {
    workoutCountByDate.set(w.date, (workoutCountByDate.get(w.date) ?? 0) + 1)
  }

  const days: DayConsistency[] = daily.map(d => {
    const isPartial = d.active_kcal === null && d.exercise_min === null
    const kb = kcalBucket(d.active_kcal)
    const mb = minBucket(d.exercise_min)
    let bucket: ActivityBucket
    if (isPartial) bucket = 0
    else if (kb === null) bucket = mb ?? 0
    else if (mb === null) bucket = kb
    else bucket = Math.max(kb, mb) as ActivityBucket
    return {
      date: d.date,
      bucket,
      exerciseMin: d.exercise_min,
      activeKcal: d.active_kcal,
      workoutCount: workoutCountByDate.get(d.date) ?? 0,
      isPartial,
    }
  })

  let longestStreak = 0
  let currentRun = 0
  for (const day of days) {
    if (day.isPartial) continue // transparent: neither extends nor breaks
    if (day.bucket >= 1) {
      currentRun += 1
      if (currentRun > longestStreak) longestStreak = currentRun
    } else {
      currentRun = 0
    }
  }

  const totalActiveDays = days.filter(d => !d.isPartial && d.bucket >= 1).length
  const nonPartialDays = days.filter(d => !d.isPartial).length
  const pctActive = nonPartialDays > 0 ? (totalActiveDays / nonPartialDays) * 100 : 0

  return { days, currentStreak: currentRun, longestStreak, totalActiveDays, pctActive }
}

// ─── Correlation / insights ──────────────────────────────────────
export function stddev(values: number[]): number {
  if (values.length < 2) return 0
  const m = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/** Pearson correlation. Returns 0 for n<2 or zero-variance (no div-by-zero). */
export function pearsonR(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return 0
  let sx = 0, sy = 0
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i] }
  const mx = sx / n, my = sy / n
  let num = 0, dx = 0, dy = 0
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx, b = ys[i] - my
    num += a * b; dx += a * a; dy += b * b
  }
  const den = Math.sqrt(dx * dy)
  return den === 0 ? 0 : num / den
}

// Local-date arithmetic (tz-safe — avoids toISOString UTC drift on +UTC zones).
function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Join each sleep night to the daily row `dayOffset` days later (1 = next-day readiness). */
export function joinSleepToDaily(data: HealthData, dayOffset = 1): { night: SleepNight; next: DailyMetric }[] {
  const byDate = new Map(data.daily.map(d => [d.date, d]))
  const out: { night: SleepNight; next: DailyMetric }[] = []
  for (const night of data.sleep.nights) {
    const target = dayOffset === 0 ? night.date : addDays(night.date, dayOffset)
    const next = byDate.get(target)
    if (next) out.push({ night, next })
  }
  return out
}

export interface CorrelationInsight {
  key: string
  title: string
  xLabel: string
  yLabel: string
  r: number
  n: number
  smallSample: boolean
  strength: 'none' | 'weak' | 'moderate' | 'strong'
  read: string
  accent: string
}

export interface SignalInsight {
  key: string
  title: string
  value: string
  detail: string
  accent: string
}

export interface InsightsResult {
  narrative: string
  correlations: CorrelationInsight[]
  signals: SignalInsight[]
}

function strengthOf(r: number): CorrelationInsight['strength'] {
  const a = Math.abs(r)
  return a < 0.2 ? 'none' : a < 0.4 ? 'weak' : a < 0.7 ? 'moderate' : 'strong'
}

// Build same-window lagged pairs: x on day d, y on day d+offset, nulls dropped.
function lagPairs(
  daily: DailyMetric[],
  x: (d: DailyMetric) => number | null,
  y: (d: DailyMetric) => number | null,
  offset = 1,
): { xs: number[]; ys: number[] } {
  const byDate = new Map(daily.map(d => [d.date, d]))
  const xs: number[] = [], ys: number[] = []
  for (const d of daily) {
    const xv = x(d)
    const nd = byDate.get(addDays(d.date, offset))
    const yv = nd ? y(nd) : null
    if (xv !== null && yv !== null) { xs.push(xv); ys.push(yv) }
  }
  return { xs, ys }
}

// Build aligned (x, y) pairs from arbitrary items, dropping a pair when EITHER
// value is null so the two arrays never misalign (pearsonR pairs by index).
export function pairDrop<T>(items: T[], xf: (t: T) => number | null, yf: (t: T) => number | null): { xs: number[]; ys: number[] } {
  const xs: number[] = [], ys: number[] = []
  for (const it of items) {
    const x = xf(it), y = yf(it)
    if (x !== null && y !== null) { xs.push(x); ys.push(y) }
  }
  return { xs, ys }
}

function hm(hours: number): string {
  const h = Math.floor(hours)
  return `${h}h ${Math.round((hours - h) * 60)}m`
}

/**
 * Assembles the Insights section: lagged correlations (load/sleep → next-day
 * recovery), latent signals already computed elsewhere but never surfaced, and a
 * threshold-triggered auto-narrative (same `reasons.join(' · ')` pattern as the
 * existing coach takeaway).
 */
export function buildInsights(data: HealthData): InsightsResult {
  const recovery = analyzeRecovery(data)
  const sleep = analyzeSleep(data)
  const weekly = buildWeeklyAggregates(data)

  const mkCorr = (
    key: string, title: string, xLabel: string, yLabel: string,
    pairs: { xs: number[]; ys: number[] }, accent: string,
    read: (r: number, strength: CorrelationInsight['strength']) => string,
  ): CorrelationInsight => {
    const r = pearsonR(pairs.xs, pairs.ys)
    const n = Math.min(pairs.xs.length, pairs.ys.length)
    const strength = strengthOf(r)
    return { key, title, xLabel, yLabel, r, n, smallSample: n < 20, strength, read: read(r, strength), accent }
  }

  const correlations: CorrelationInsight[] = [
    mkCorr('load-hrv', 'Training load → next-day HRV', 'Exercise min', 'Next-day HRV',
      lagPairs(data.daily, d => d.exercise_min, d => d.hrv_ms), 'var(--accent-teal)',
      (r, s) => s === 'none' ? 'No clear link this period — load isn’t obviously denting recovery.'
        : r < 0 ? `Harder days tend to drop next-day HRV (${s} link) — a real training cost worth pacing.`
        : `Higher load tracks with higher next-day HRV (${s}) — you’re absorbing the volume well.`),
    mkCorr('kcal-rhr', 'Active burn → next-day resting HR', 'Active kcal', 'Next-day RHR',
      lagPairs(data.daily, d => d.active_kcal, d => d.resting_hr), 'var(--accent-coral)',
      (r, s) => s === 'none' ? 'No clear link — burn isn’t elevating next-morning resting HR.'
        : r > 0 ? `Bigger burn days nudge next-morning RHR up (${s}) — autonomic load showing through.`
        : `More burn tracks with lower next-day RHR (${s}) — fitness adaptation outpacing fatigue.`),
    mkCorr('sleep-hrv', 'Sleep duration → next-day HRV', 'In-bed hrs', 'Next-day HRV',
      pairDrop(joinSleepToDaily(data, 1), p => p.night.in_bed_hours, p => p.next.hrv_ms),
      'var(--accent-purple)',
      (r, s) => s === 'none' ? 'No clear link in the sleep-tracked window.'
        : r > 0 ? `More sleep tends to lift next-day HRV (${s}) — recovery responds to rest.`
        : `Longer sleep tracks with lower next-day HRV (${s}) — unusual; likely small-sample noise.`),
    mkCorr('sleep-rhr', 'Sleep duration → next-day resting HR', 'In-bed hrs', 'Next-day RHR',
      pairDrop(joinSleepToDaily(data, 1), p => p.night.in_bed_hours, p => p.next.resting_hr),
      'var(--accent-blue)',
      (r, s) => s === 'none' ? 'No clear link in the sleep-tracked window.'
        : r < 0 ? `More sleep tracks with a lower next-morning RHR (${s}) — restorative.`
        : `More sleep tracks with higher next-day RHR (${s}) — likely small-sample noise.`),
  ]

  // Latent signals (computed elsewhere, never surfaced as cards)
  const rhrSlope = trendSlope(weekly.map(w => w.rhrAvg))
  const hrvSlope = trendSlope(weekly.map(w => w.hrvAvg))
  const signals: SignalInsight[] = [
    {
      key: 'sleep-extremes', title: 'Sleep range',
      value: `${hm(sleep.bestNight.in_bed_hours)} / ${hm(sleep.worstNight.in_bed_hours)}`,
      detail: `Best ${fmtShort(sleep.bestNight.date)} · Worst ${fmtShort(sleep.worstNight.date)} · ${sleep.consistency} consistency`,
      accent: 'var(--accent-purple)',
    },
    {
      key: 'rhr-trend', title: 'Weekly RHR trend',
      value: `${rhrSlope <= 0 ? '↓' : '↑'} ${Math.abs(rhrSlope).toFixed(1)} bpm/wk`,
      detail: rhrSlope <= 0 ? 'Resting HR easing across weeks — recovering well.' : 'Resting HR creeping up week over week.',
      accent: rhrSlope <= 0 ? 'var(--accent-green)' : 'var(--accent-coral)',
    },
    {
      key: 'hrv-trend', title: 'Weekly HRV trend',
      value: `${hrvSlope >= 0 ? '↑' : '↓'} ${Math.abs(hrvSlope).toFixed(1)} ms/wk`,
      detail: hrvSlope >= 0 ? 'HRV trending up — building parasympathetic capacity.' : 'HRV drifting down across weeks.',
      accent: hrvSlope >= 0 ? 'var(--accent-green)' : 'var(--accent-coral)',
    },
    {
      key: 'fatigue', title: 'Fatigue load',
      value: `${recovery.fatigueScore}/100`,
      detail: `Training load ${recovery.loadTrend} · VO₂ ${recovery.vo2Trend}`,
      accent: recovery.fatigueScore >= 50 ? 'var(--accent-coral)' : recovery.fatigueScore >= 30 ? 'var(--accent-amber)' : 'var(--accent-green)',
    },
  ]

  // Auto-narrative — strongest signals, threshold-triggered, joined like the coach takeaway.
  const reasons: string[] = []
  const topCorr = [...correlations].filter(c => c.strength !== 'none').sort((a, b) => Math.abs(b.r) - Math.abs(a.r))[0]
  if (topCorr) reasons.push(`${topCorr.title} shows a ${topCorr.strength} ${topCorr.r >= 0 ? 'positive' : 'negative'} link (r ${topCorr.r.toFixed(2)}, n ${topCorr.n})`)
  if (recovery.fatigueScore >= 30) reasons.push(`fatigue load is ${recovery.fatigueScore}/100`)
  if (rhrSlope > 0.2) reasons.push('resting HR is creeping up week over week')
  else if (rhrSlope < -0.2) reasons.push('resting HR is easing week over week')
  if (sleep.consistency === 'erratic') reasons.push('sleep timing is erratic — a likely lever')
  const narrative = reasons.length ? `${reasons.join(' · ')}.` : 'Signals are steady — no standout correlations or drift this period.'

  return { narrative, correlations, signals }
}
