// lib/helpers.ts — derived stats, signal analysis, recommendation engine
import type { DailyMetric, HealthData, VO2Point, Workout, SleepNight } from './types'

// ─── Date helpers ────────────────────────────────────────────────
export function fmtShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
}

export function fmtFull(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function dayOfWeek(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

// ─── Slicing ─────────────────────────────────────────────────────
export function lastNDays(daily: DailyMetric[], n: number): DailyMetric[] {
  return daily.slice(-n)
}

export function workoutsInRange(workouts: Workout[], startDate: string): Workout[] {
  return workouts.filter(w => w.date >= startDate)
}

export function workoutsLastNDays(workouts: Workout[], daily: DailyMetric[], n: number): Workout[] {
  const cutoff = daily[daily.length - n]?.date
  if (!cutoff) return []
  return workouts.filter(w => w.date >= cutoff)
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
    const days = groups.get(k)!
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
  avgTotal: number
  avgDeepPct: number
  avgRemPct: number
  deepBelowTarget: boolean
  variability: number
  consistency: 'tight' | 'moderate' | 'erratic'
  bestNight: SleepNight
  worstNight: SleepNight
}

export function analyzeSleep(data: HealthData): SleepSignals {
  const s = data.sleep.summary
  const nights = data.sleep.nights
  const bestNight = nights.reduce((a, b) => (b.total_sleep_hours > a.total_sleep_hours ? b : a))
  const worstNight = nights.reduce((a, b) => (b.total_sleep_hours < a.total_sleep_hours ? b : a))
  const consistency: 'tight' | 'moderate' | 'erratic' =
    s.stdev_hours < 0.7 ? 'tight' : s.stdev_hours < 1.2 ? 'moderate' : 'erratic'
  return {
    avgTotal: s.avg_total_hours,
    avgDeepPct: s.avg_deep_pct,
    avgRemPct: s.avg_rem_pct,
    deepBelowTarget: s.avg_deep_pct < 13,
    variability: s.stdev_hours,
    consistency,
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
  if (r.rhrDelta !== null && r.rhrDelta > 3) reasons.push(`RHR +${r.rhrDelta.toFixed(1)} bpm above 91-day baseline`)
  if (r.hrvDelta !== null && r.hrvDelta < -5) reasons.push(`HRV ${r.hrvDelta.toFixed(1)} ms below baseline`)
  if (r.walkingHrRecent && r.walkingHrRecent > 130) reasons.push(`Walking HR ${r.walkingHrRecent.toFixed(0)} bpm — elevated`)
  if (s.deepBelowTarget) reasons.push(`Deep sleep ${s.avgDeepPct.toFixed(1)}% — below 13% target`)
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
  const last2DeepHours = data.sleep.nights.slice(-2).map(n => n.deep_hours)
  const deepMet = last2DeepHours.length === 2 && last2DeepHours.every(h => h >= 1.0)

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
      label: 'Deep sleep ≥ 60 min · 2 nights running',
      target: '≥ 1.0 h deep',
      current: last2DeepHours.length > 0 ? `last 2: ${last2DeepHours.map(h => (h * 60).toFixed(0)).join(', ')} min` : 'gap in data',
      met: deepMet,
    },
  ]

  return { status, headline: headlineMap[status], rationale, durationDays: durationMap[status], daily_protocol, do: doList, avoid: avoidList, return_criteria }
}

// ─── Workout recommendation ──────────────────────────────────────
export interface WorkoutBlock {
  name: string
  sets?: string
  detail: string
  intensity: 'low' | 'mod' | 'high'
}

export interface WorkoutDay {
  day: string
  focus: string
  zone: string
  duration_min: number
  blocks: WorkoutBlock[]
  rationale: string
  shoulder_safe: boolean
  cites?: string[]  // user constraints / data points the day addresses
}

export interface WorkoutRecommendation {
  cycle_name: string
  rationale: string
  start_date: string
  end_date: string
  weekly_volume_min: number
  days: WorkoutDay[]
  guardrails: string[]
}

export function buildWorkoutRecommendation(data: HealthData): WorkoutRecommendation {
  // Recovery-led 7-day cycle starting after rest period
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() + 1)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const days: WorkoutDay[] = [
    {
      day: 'Day 1',
      focus: 'Active Recovery + Mobility',
      zone: 'Z1 · sub-110 bpm',
      duration_min: 50,
      shoulder_safe: true,
      rationale: 'Re-set autonomic balance. Move blood, no metabolic stress.',
      cites: ['VO₂ −5.9% off Apr 8 peak', `RHR +${(analyzeRecovery(data).rhrDelta ?? 0).toFixed(1)} bpm above baseline`],
      blocks: [
        { name: 'Walk — outdoor', detail: '40 min · Z1 · sun on skin first 20 min', intensity: 'low' },
        { name: 'Mobility flow', detail: 'Shoulder CARs · thoracic openers · 90/90 hip · couch stretch', intensity: 'low' },
      ],
    },
    {
      day: 'Day 2',
      focus: 'Lower Body Strength',
      zone: 'Z2 · 110–130 bpm',
      duration_min: 55,
      shoulder_safe: true,
      rationale: 'Lower body responds well to load and is unaffected by shoulder. Pattern hip hinge + squat.',
      cites: ['Honors: left shoulder internal rotation pain', 'Honors: left hip discomfort — moderate, not maximal load'],
      blocks: [
        { name: 'Goblet squat',     sets: '4 × 8',  detail: '44 lb barbell front-loaded · 2 sec descent · full ROM', intensity: 'mod' },
        { name: 'Romanian deadlift', sets: '4 × 8',  detail: 'Slow eccentric · neutral spine · stretch hamstrings', intensity: 'mod' },
        { name: 'Reverse lunge',    sets: '3 × 10/leg', detail: 'Bodyweight or barbell · drive through front heel', intensity: 'mod' },
        { name: 'Pallof press',     sets: '3 × 10/side', detail: 'Anti-rotation core · band or cable', intensity: 'low' },
        { name: 'Hanging knee raise', sets: '3 × 8', detail: 'Slow controlled · hollow body finish', intensity: 'mod' },
      ],
    },
    {
      day: 'Day 3',
      focus: 'Skill + Aerobic Base',
      zone: 'Z2-3 · 120–145 bpm',
      duration_min: 75,
      shoulder_safe: true,
      rationale: 'Pickleball is your highest-frequency court activity. Train it, but cap intensity to spare shoulder.',
      cites: ['24 pickleball sessions logged this period (1,004 min)', 'Honors: left shoulder — drilling only, no slams'],
      blocks: [
        { name: 'Pickleball (drilling)', detail: '45 min · dink rallies · third-shot drops · no slams', intensity: 'mod' },
        { name: 'Walk cooldown',         detail: '20 min · Z1 · breathe nasal-only', intensity: 'low' },
        { name: 'Rotator cuff prehab',   detail: '3 × 12 banded ER · 3 × 12 face-pulls · LIGHT', intensity: 'low' },
      ],
    },
    {
      day: 'Day 4',
      focus: 'Upper Pull + Shoulder-Safe Push',
      zone: 'Z2 · 110–130 bpm',
      duration_min: 50,
      shoulder_safe: true,
      rationale: 'Build pulling strength to balance posture. Avoid loaded internal rotation entirely.',
      cites: ['Honors: left shoulder internal rotation pain — no overhead pressing', 'Pushup volume reduced this week (100 vs 190 prior)'],
      blocks: [
        { name: 'Bent-over row',     sets: '4 × 8',  detail: '44 lb barbell · pull to lower ribs · pause 1 sec', intensity: 'mod' },
        { name: 'Floor press',       sets: '3 × 8',  detail: 'Neutral grip · floor protects shoulder ROM', intensity: 'mod' },
        { name: 'Barbell curl',      sets: '3 × 10', detail: 'Slow controlled · no swing', intensity: 'mod' },
        { name: 'Wall slides',       sets: '3 × 10', detail: 'Scap upward rotation drill', intensity: 'low' },
        { name: 'Pushups (modified)', sets: '3 × max comfortable', detail: 'Stop 2 reps shy of failure · pain-free range', intensity: 'mod' },
      ],
    },
    {
      day: 'Day 5',
      focus: 'Yoga + Long Walk',
      zone: 'Z1 · sub-110 bpm',
      duration_min: 60,
      shoulder_safe: true,
      rationale: 'Parasympathetic day. Drives HRV up before weekend output.',
      cites: [`Deep sleep ${analyzeSleep(data).avgDeepPct.toFixed(1)}% — below 13% target`, 'Sleep stdev ±1.01h — consistency erratic'],
      blocks: [
        { name: 'Yoga flow',  detail: '30 min · slow pace · hold poses 5 breaths · hip + thoracic focus', intensity: 'low' },
        { name: 'Walk',       detail: '30 min · outdoor · phone-free', intensity: 'low' },
      ],
    },
    {
      day: 'Day 6',
      focus: 'Golf — Aerobic Game',
      zone: 'Z2 · 100–130 bpm',
      duration_min: 180,
      shoulder_safe: true,
      rationale: 'Golf has been your top calorie engine (8,617 kcal across 20 rounds). Walk the course.',
      cites: ['20 rounds · 8,617 kcal · 22.6 hrs played', 'Highest single-day burn was a 1,330 kcal round (Apr 12)'],
      blocks: [
        { name: 'Walking 18',     detail: '~10k steps · push cart > riding · keep effort steady', intensity: 'mod' },
        { name: 'Hydration',      detail: '24 oz water + electrolytes per 9', intensity: 'low' },
      ],
    },
    {
      day: 'Day 7',
      focus: 'Lower-Body Power + Core',
      zone: 'Z3 · 130–150 bpm peaks',
      duration_min: 50,
      shoulder_safe: true,
      rationale: 'Re-introduce a power stimulus. Short, sharp, fully recovered between sets.',
      cites: ['Re-test VO₂ next reading — looking for rebound from 36.08'],
      blocks: [
        { name: 'Front squat',         sets: '4 × 6',  detail: 'Slightly heavier than goblet · clean elbows', intensity: 'high' },
        { name: 'Single-leg RDL',      sets: '3 × 6/leg', detail: 'Balance challenge · light load', intensity: 'mod' },
        { name: 'Box jump or step-up', sets: '4 × 5', detail: 'Explosive · full reset between reps', intensity: 'high' },
        { name: 'Side plank',          sets: '3 × 30 s/side', detail: 'Stack hips · ribs down', intensity: 'mod' },
        { name: 'Stair sprints',       sets: '6 × 30 s', detail: '90 s rest · cap effort at 80%', intensity: 'high' },
      ],
    },
  ]

  const guardrails = [
    'No loaded overhead pressing for the full cycle',
    'No max-effort pushup sets — protect shoulder',
    'Cap pickleball at drilling, not competitive games',
    'If RHR > 70 bpm at wake, downgrade that day to mobility only',
    'Walk barefoot post-workout to decompress feet/ankles',
    'Re-test VO₂ trend after Day 7 — expect rebound',
  ]

  const weekly_volume_min = days.reduce((a, d) => a + d.duration_min, 0)

  return {
    cycle_name: 'Recovery-Led Build · Week 1',
    rationale:
      'Built around your 91-day load: huge aerobic base from walking/golf/pickleball, but VO₂ rolling off peak and shoulder flagged. ' +
      'This cycle protects the shoulder, defends sleep, and reintroduces lower-body strength + power without spiking systemic load.',
    start_date: fmt(start),
    end_date: fmt(end),
    weekly_volume_min,
    days,
    guardrails,
  }
}
