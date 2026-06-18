// scripts/convert-export.mjs
// Converts a raw Apple Health JSON export (per-metric series schema) into the
// minimized, committed dashboard module lib/imported-health-export.ts.
//
// Run:  node scripts/convert-export.mjs ["/path/to/export.json"]
// Default source is the iCloud export path below. Re-runnable for future exports
// (including a future sleep-with-stages export).
//
// Honors the privacy convention: only fields shown on the dashboard are emitted
// (walking speed / steadiness / gait are intentionally dropped this pass).

import { readFileSync, writeFileSync } from 'node:fs'

const SRC =
  process.argv[2] ||
  '/Users/boydroberts/Library/Mobile Documents/com~apple~CloudDocs/AI/health data 6mo.json'
const OUT = new URL('../lib/imported-health-export.ts', import.meta.url)

const raw = JSON.parse(readFileSync(SRC, 'utf8'))

// ── Guardrails: fail loudly if pointed at a stale/partial export ──
if (raw?.meta?.sleep_added !== true) {
  throw new Error(`Refusing to convert: meta.sleep_added !== true (stale export?). Source: ${SRC}`)
}
if (!raw.sleep?.data?.length) throw new Error('Refusing to convert: no sleep.data')
if (!raw.workouts?.data?.length) throw new Error('Refusing to convert: no workouts.data')

const round = (v, d = 2) => (v == null ? null : Math.round(v * 10 ** d) / 10 ** d)

// ── daily: left-join all metric series by date over the full range ──
const dailySeries = raw.daily
const seriesMap = (key) => {
  const m = new Map()
  for (const p of dailySeries[key]?.data ?? []) m.set(p.date, p.value)
  return m
}
const steps = seriesMap('steps')
const activeCal = seriesMap('activeCalories')
const restCal = seriesMap('restingCalories')
const exMin = seriesMap('exerciseMinutes')
const flights = seriesMap('flightsClimbed')
const dist = seriesMap('distanceWalkingRunning')
const hr = seriesMap('heartRate')
const walkHr = seriesMap('walkingHeartRate')
const rhr = seriesMap('restingHeartRate')
const hrv = seriesMap('hrv')
const spo2 = seriesMap('oxygenSaturation') // already ×100 in this file
const resp = seriesMap('respiratoryRate')

const allDates = new Set()
for (const k of Object.keys(dailySeries)) for (const p of dailySeries[k].data ?? []) allDates.add(p.date)
const dates = [...allDates].sort()

const dailyOverrides = dates.map((date) => ({
  date,
  steps: steps.get(date) ?? 0,
  active_calories_kcal: activeCal.has(date) ? round(activeCal.get(date), 1) : null,
  resting_calories_kcal: restCal.has(date) ? round(restCal.get(date), 1) : null,
  walking_running_distance_km: dist.has(date) ? round(dist.get(date), 3) : 0,
  exercise_minutes: exMin.has(date) ? exMin.get(date) : null,
  heart_rate_avg_bpm: hr.has(date) ? round(hr.get(date), 1) : null,
  resting_heart_rate_bpm: rhr.has(date) ? rhr.get(date) : null,
  hrv_sdnn_ms: hrv.has(date) ? round(hrv.get(date), 1) : null,
  walking_hr_avg_bpm: walkHr.has(date) ? round(walkHr.get(date), 1) : null,
  blood_oxygen_pct: spo2.has(date) ? round(spo2.get(date), 1) : null,
  flights_climbed: flights.get(date) ?? 0,
  respiratory_rate_brpm: resp.has(date) ? round(resp.get(date), 1) : null,
}))

// ── workouts: synthesize start/end (no clock time in source) ──
const pad = (n) => String(n).padStart(2, '0')
const workouts = raw.workouts.data.map((w) => {
  const startMin = 12 * 60 // noon, local-naive
  const endMin = startMin + Math.round(w.duration_min)
  const start = `${w.date}T${pad(Math.floor(startMin / 60))}:${pad(startMin % 60)}:00`
  const end = `${w.date}T${pad(Math.floor(endMin / 60))}:${pad(endMin % 60)}:00`
  return {
    start,
    end,
    activity_type: w.type,
    duration_min: Math.round(w.duration_min),
    distance_km: w.distance_km == null ? null : round(w.distance_km, 3),
    calories: Math.round(w.calories),
  }
})

// ── vo2: dedupe same-day (keep max), ascending ──
const vo2ByDate = new Map()
for (const p of raw.vo2Max.data) {
  const cur = vo2ByDate.get(p.date)
  if (cur == null || p.value > cur) vo2ByDate.set(p.date, p.value)
}
const vo2Max = [...vo2ByDate.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([date, value]) => ({ date, value_ml_kg_min: round(value, 2) }))

// ── sleep: pass-through structural fields (nap-flagging + summary in normalizer) ──
const sleep = raw.sleep.data.map((n) => ({
  wake_date: n.wake_date,
  total_in_bed_min: n.total_in_bed_min,
  bedtime_local: n.bedtime_local,
  wake_time_local: n.wake_time_local,
}))
const sleepCoverage = raw.sleep?.notes?.coverage ?? ''

// ── body weight ──
const w0 = raw.bodyMeasurements.weight.data[0]

// ── pushups: manual log (not in any Apple export) — carried forward ──
const pushupsManualLog = {
  note: 'Manually tracked; not from Apple Health',
  weekly: [
    {
      week: '2026-04-06 to 2026-04-12',
      total: 120,
      sessions: [
        { date: '2026-04-06', reps: 30 },
        { date: '2026-04-08', reps: 30 },
        { date: '2026-04-10', reps: 20 },
        { date: '2026-04-11', reps: 40 },
      ],
    },
    { week: '2026-04-13 to 2026-04-18', total: 190, sessions: [] },
    { week: '2026-04-20 to 2026-04-26', total: 100, note: 'Reduced - shoulder fatigue', sessions: [] },
  ],
}

const exportObj = {
  export_date: (raw.meta.exported_at ?? '').slice(0, 10),
  period: { start: raw.meta.period.start, end: raw.meta.period.end },
  timezone: raw.meta.timezone ?? 'America/Chicago',
  source: raw.meta.source ?? 'Apple Health / Apple Watch',
  generatedBy: 'Apple Health export → scripts/convert-export.mjs',
  dailyOverrides,
  vo2Max,
  workouts,
  sleep,
  sleepCoverage,
  bodyMeasurement: {
    weight_kg: round(w0.value, 2),
    measured_date: w0.date,
    note: raw.bodyMeasurements.weight.note ?? 'Single reading in window',
  },
  pushupsManualLog,
}

// ── emit TS module ──
const J = (v) => JSON.stringify(v)
const lines = (arr) => arr.map((x) => '    ' + J(x) + ',').join('\n')

const banner = `// AUTO-GENERATED by scripts/convert-export.mjs — do not edit by hand.
// Minimized dashboard import (displayed fields only; no raw export committed).
// Source export: ${exportObj.export_date} · period ${exportObj.period.start} → ${exportObj.period.end}.
`

const interfaces = `export interface ImportedDailyMetric {
  date: string
  steps: number
  active_calories_kcal: number | null
  resting_calories_kcal: number | null
  walking_running_distance_km: number
  exercise_minutes: number | null
  heart_rate_avg_bpm: number | null
  resting_heart_rate_bpm: number | null
  hrv_sdnn_ms: number | null
  walking_hr_avg_bpm: number | null
  blood_oxygen_pct: number | null
  flights_climbed: number
  respiratory_rate_brpm: number | null
}

export interface ImportedWorkout {
  start: string
  end: string
  activity_type: string
  duration_min: number
  distance_km: number | null
  calories: number
}

export interface ImportedVO2Point {
  date: string
  value_ml_kg_min: number
}

export interface ImportedSleepNight {
  wake_date: string
  total_in_bed_min: number
  bedtime_local: string
  wake_time_local: string
}

export interface ImportedPushupWeek {
  week: string
  total: number
  note?: string
  sessions: { date: string; reps: number }[]
}

export interface ImportedHealthExport {
  export_date: string
  period: { start: string; end: string }
  timezone: string
  source: string
  generatedBy: string
  dailyOverrides: ImportedDailyMetric[]
  vo2Max: ImportedVO2Point[]
  workouts: ImportedWorkout[]
  sleep: ImportedSleepNight[]
  sleepCoverage: string
  bodyMeasurement: {
    weight_kg: number
    measured_date: string
    note: string
  }
  pushupsManualLog: {
    note: string
    weekly: ImportedPushupWeek[]
  }
}
`

const body = `export const latestHealthExport: ImportedHealthExport = {
  export_date: ${J(exportObj.export_date)},
  period: ${J(exportObj.period)},
  timezone: ${J(exportObj.timezone)},
  source: ${J(exportObj.source)},
  generatedBy: ${J(exportObj.generatedBy)},
  dailyOverrides: [
${lines(dailyOverrides)}
  ],
  vo2Max: [
${lines(vo2Max)}
  ],
  workouts: [
${lines(workouts)}
  ],
  sleep: [
${lines(sleep)}
  ],
  sleepCoverage: ${J(exportObj.sleepCoverage)},
  bodyMeasurement: ${J(exportObj.bodyMeasurement)},
  pushupsManualLog: ${JSON.stringify(pushupsManualLog, null, 2).replace(/\n/g, '\n  ')},
}
`

writeFileSync(OUT, banner + '\n' + interfaces + '\n' + body)
console.log(
  `Wrote ${OUT.pathname}\n  daily=${dailyOverrides.length} workouts=${workouts.length} ` +
    `vo2=${vo2Max.length} sleep=${sleep.length} period=${exportObj.period.start}→${exportObj.period.end}`,
)
