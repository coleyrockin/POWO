import assert from 'node:assert/strict'
import { normalizeHealthExport } from '../lib/normalize-health-export.ts'
import type { HealthData } from '../lib/types.ts'
import type { ImportedDailyMetric, ImportedHealthExport } from '../lib/imported-health-export.ts'

// Minimal curated base — normalizer derives everything data-driven from `latest`.
const base: HealthData = {
  meta: { owner: 'Coley', generated_at: '', source: 'base', period: { start: '', end: '', days: 0 }, schema_version: '3.0', notes: '' },
  profile: { age_band: 't', primary_goal: 't', weight_kg: 0, weight_lbs: 0, weight_date: '', active_lifestyle: [], training_focus: 't', current_constraints: [], equipment: [] },
  summary: {
    period_totals: { total_steps: 0, total_active_kcal: 0, total_exercise_min: 0, total_distance_km: 0, total_workouts: 0, total_flights_climbed: 0 },
    averages: { avg_daily_steps: 0, avg_active_kcal: 0, avg_resting_hr: 0, avg_hrv_ms: 0, avg_exercise_min: 0 },
    best_days: { max_steps: { date: '', value: 0 }, max_active_kcal: { date: '', value: 0 }, max_exercise_min: { date: '', value: 0 } },
    vo2_max_progression: { first: { date: '', value: 0 }, peak: { date: '', value: 0 }, current: { date: '', value: 0 } },
  },
  monthly: {}, daily: [], vo2_max: [], workouts: [], workout_summary: [], pushups: { unit: 'reps', weeks: [] },
  sleep: { nights: [], coverage_note: '', summary: { nights_with_data: 0, avg_in_bed_hours: 0, min_in_bed_hours: 0, max_in_bed_hours: 0, stdev_hours: 0, typical_bedtime: '', typical_wake: '', naps: 0 } },
}

function imDay(date: string, o: Partial<ImportedDailyMetric> = {}): ImportedDailyMetric {
  return {
    date, steps: 5000, active_calories_kcal: 400, resting_calories_kcal: 1800,
    walking_running_distance_km: 5, exercise_minutes: 45, heart_rate_avg_bpm: 80,
    resting_heart_rate_bpm: 60, hrv_sdnn_ms: 50, walking_hr_avg_bpm: null,
    blood_oxygen_pct: 96, flights_climbed: 10, respiratory_rate_brpm: 14, ...o,
  }
}

const latest: ImportedHealthExport = {
  export_date: '2026-06-11',
  period: { start: '2026-06-08', end: '2026-06-10' },
  timezone: 'America/Chicago',
  source: 'Apple Health / Apple Watch',
  generatedBy: 'normalizer regression test',
  dailyOverrides: [
    imDay('2026-06-08', { steps: 8000 }),
    imDay('2026-06-09', { steps: 9000 }),
    imDay('2026-06-10', { steps: 10000, active_calories_kcal: null, exercise_minutes: null, hrv_sdnn_ms: null, resting_heart_rate_bpm: 61 }),
  ],
  vo2Max: [
    { date: '2026-06-03', value_ml_kg_min: 36 },
    { date: '2026-06-10', value_ml_kg_min: 37 },
  ],
  workouts: [
    { start: '2026-06-10T12:00:00', end: '2026-06-10T12:30:00', activity_type: 'Unknown Activity', duration_min: 30, distance_km: null, calories: 220 },
    { start: '2026-06-09T12:00:00', end: '2026-06-09T12:44:00', activity_type: 'Skating Sports', duration_min: 44, distance_km: 2.7, calories: 488 },
    { start: '2026-06-08T12:00:00', end: '2026-06-08T12:30:00', activity_type: 'Paddle Sports', duration_min: 30, distance_km: 0.7, calories: 295 },
  ],
  sleep: [
    { wake_date: '2026-06-08', total_in_bed_min: 480, bedtime_local: '23:00', wake_time_local: '07:00' }, // 8.0h night
    { wake_date: '2026-06-09', total_in_bed_min: 420, bedtime_local: '23:30', wake_time_local: '06:30' }, // 7.0h night
    { wake_date: '2026-06-09', total_in_bed_min: 90, bedtime_local: '14:00', wake_time_local: '15:30' },  // nap: short + daytime
  ],
  sleepCoverage: 'test coverage note',
  bodyMeasurement: { weight_kg: 79, measured_date: '2026-06-10', note: 'test reading' },
  pushupsManualLog: { note: 'test pushup log', weekly: [] },
}

const n = normalizeHealthExport(base, latest)

// ── daily: imported overrides only (no base-carry / signal-shift) ──
assert.deepEqual(n.daily.map(d => d.date), ['2026-06-08', '2026-06-09', '2026-06-10'], 'daily = imported overrides, sorted ascending')
assert.equal(n.daily.find(d => d.date === '2026-06-10')?.active_kcal, null, 'partial day preserves null active kcal')
assert.equal(n.daily.find(d => d.date === '2026-06-08')?.flights_climbed, 10, 'flights_climbed mapped from import (was hardcoded 0 before)')
assert.equal(n.daily.find(d => d.date === '2026-06-08')?.respiratory_rate, 14, 'respiratory_rate mapped from import (was hardcoded null before)')
assert.equal(n.daily.find(d => d.date === '2026-06-08')?.distance_m, 5000, 'distance km → m')

// ── workouts: imported only, newest-first, types normalized ──
assert.deepEqual(n.workouts.map(w => w.date), ['2026-06-10', '2026-06-09', '2026-06-08'], 'workouts imported only, newest first')
assert.equal(n.workouts.find(w => w.date === '2026-06-10')?.type, 'Pickleball', 'Unknown Activity → Pickleball')
assert.equal(n.workouts.find(w => w.date === '2026-06-09')?.type, 'Skating', 'Skating Sports → Skating')
assert.equal(n.workouts.find(w => w.date === '2026-06-08')?.type, 'Paddling', 'Paddle Sports → Paddling')

// ── vo2: daily points {date, value} ──
assert.deepEqual(n.vo2_max, [{ date: '2026-06-03', value: 36 }, { date: '2026-06-10', value: 37 }], 'vo2 points mapped from {date, value_ml_kg_min}')
assert.equal(n.summary.vo2_max_progression.current.value, 37, 'vo2 current = last point')

// ── summary + meta ──
assert.equal(n.summary.period_totals.total_workouts, 3)
assert.equal(n.meta.period.days, 3)
assert.equal(n.profile.weight_kg, 79, 'weight from import bodyMeasurement')

// ── sleep: duration/timing model, naps excluded from nightly stats ──
assert.equal(n.sleep.nights.length, 3, 'all sleep entries kept in nights[] (incl nap)')
assert.equal(n.sleep.summary.nights_with_data, 2, 'nap excluded from nightly count')
assert.equal(n.sleep.summary.naps, 1, 'one nap flagged')
assert.equal(n.sleep.nights.find(x => x.in_bed_hours < 2)?.isNap, true, 'short daytime entry marked isNap')
assert.equal(n.sleep.summary.avg_in_bed_hours, 7.5, 'avg of 8.0h + 7.0h = 7.5h (nap excluded)')
assert.equal(n.sleep.summary.max_in_bed_hours, 8, 'max real night = 8.0h')
assert.equal(n.sleep.summary.min_in_bed_hours, 7, 'min real night = 7.0h')
assert.equal(n.sleep.summary.typical_bedtime, '23:15', 'circular-median bedtime of 23:00 & 23:30')
assert.equal(n.sleep.summary.typical_wake, '06:45', 'median wake of 07:00 & 06:30')
assert.equal(n.sleep.coverage_note, 'test coverage note', 'coverage note carried from import')

console.log('normalize-health-export.test: all assertions passed')
