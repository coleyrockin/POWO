// scripts/adapt-pulse.mjs
// Adapts a PULSE.health.v1 export into the legacy per-metric schema that
// convert-export.mjs consumes, so it can be merged with an older export and run
// through the unchanged converter.
//
// Run:  node scripts/adapt-pulse.mjs <pulse-export.json> <out.json>
//
// Unit notes: PULSE distance is METERS but the legacy distanceWalkingRunning
// series is KM (normalize ×1000s it) → converted here. SpO₂ is already a
// percentage in both. Intentionally omitted (not in PULSE): all-day average HR,
// daily basal/resting calories (summary-only), walking speed/steadiness.
import { readFileSync, writeFileSync } from 'node:fs'

const [, , SRC, OUT] = process.argv
if (!SRC || !OUT) { console.error('usage: node scripts/adapt-pulse.mjs <pulse.json> <out.json>'); process.exit(1) }
const p = JSON.parse(readFileSync(SRC, 'utf8'))
const TZ = p.notes?.timezone || 'America/Chicago'

const localDate = iso => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
const localHM = iso => new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(iso))
const series = (arr, fn = v => v) => ({ data: (arr ?? []).map(d => ({ date: d.date, value: fn(d.value) })) })

const daily = {
  steps: series(p.activity?.steps?.daily),
  activeCalories: series(p.activity?.active_energy_kcal?.daily),
  exerciseMinutes: series(p.activity?.exercise_minutes?.daily),
  flightsClimbed: series(p.activity?.flights_climbed?.daily),
  distanceWalkingRunning: series(p.activity?.walking_running_distance_m?.daily, m => m / 1000), // m → km
  restingHeartRate: series(p.cardio?.resting_hr?.daily),
  walkingHeartRate: series(p.cardio?.walking_hr_avg?.daily),
  hrv: series(p.cardio?.hrv_sdnn?.daily),
  oxygenSaturation: series(p.cardio?.blood_oxygen_pct?.daily),
  respiratoryRate: series(p.cardio?.respiratory_rate?.daily),
}
const vo2Max = { data: (p.cardio?.vo2max?.samples ?? []).map(s => ({ date: s.date, value: s.value })) }
const sleep = {
  data: (p.sleep?.nights ?? []).map(n => ({
    wake_date: n.date,
    total_in_bed_min: Math.round((new Date(n.last_end) - new Date(n.first_start)) / 60000),
    bedtime_local: localHM(n.first_start),
    wake_time_local: localHM(n.last_end),
  })),
}
const workouts = {
  data: (p.workouts?.sessions ?? []).map(w => ({
    date: localDate(w.start),
    type: w.activity,
    duration_min: Math.round((w.duration_s ?? 0) / 60),
    calories: Math.round(w.energy_kcal ?? 0),
  })),
}

const out = {
  meta: { exported_at: p.generated, period: { start: p.period.start, end: p.period.end }, timezone: TZ, source: p.source ?? 'Apple Health / Apple Watch', sleep_added: true },
  daily, vo2Max, sleep, workouts,
}
writeFileSync(OUT, JSON.stringify(out, null, 2))
console.log(`adapted ${SRC}\n  daily=${daily.steps.data.length} vo2=${vo2Max.data.length} sleep=${sleep.data.length} workouts=${workouts.data.length} → ${OUT}`)
