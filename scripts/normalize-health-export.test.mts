import assert from 'node:assert/strict'
import { normalizeHealthExport } from '../lib/normalize-health-export.ts'
import type { HealthData } from '../lib/types.ts'
import type { ImportedHealthExport } from '../lib/imported-health-export.ts'

function baseDay(date: string, steps: number, activeKcal = 400): HealthData['daily'][number] {
  return {
    date,
    steps,
    active_kcal: activeKcal,
    basal_kcal: 1800,
    total_kcal: activeKcal + 1800,
    distance_m: 5000,
    exercise_min: 45,
    stand_min: null,
    flights_climbed: 0,
    daylight_sec: null,
    avg_hr: 80,
    resting_hr: 60,
    hrv_ms: 50,
    walking_hr: 90,
    respiratory_rate: null,
    spo2_pct: 96,
  }
}

function baseWorkout(date: string, calories = 200): HealthData['workouts'][number] {
  return {
    date,
    start: `${date}T12:00:00Z`,
    end: `${date}T12:30:00Z`,
    type: 'Walking',
    duration_min: 30,
    distance_m: 3000,
    calories,
  }
}

const base: HealthData = {
  meta: {
    owner: 'Test',
    generated_at: '2026-06-01T00:00:00-05:00',
    source: 'base',
    period: { start: '2026-03-12', end: '2026-06-10', days: 91 },
    schema_version: '2.0',
    notes: 'base',
  },
  profile: {
    age_band: 'test',
    primary_goal: 'test',
    weight_kg: 80,
    weight_lbs: 176,
    weight_date: '2026-06-01',
    active_lifestyle: ['Walking'],
    training_focus: 'test',
    current_constraints: [],
    equipment: [],
  },
  summary: {
    period_totals: {
      total_steps: 0,
      total_active_kcal: 0,
      total_exercise_min: 0,
      total_distance_km: 0,
      total_workouts: 0,
      total_flights_climbed: 0,
    },
    averages: {
      avg_daily_steps: 0,
      avg_active_kcal: 0,
      avg_resting_hr: 0,
      avg_hrv_ms: 0,
      avg_exercise_min: 0,
    },
    best_days: {
      max_steps: { date: '', value: 0 },
      max_active_kcal: { date: '', value: 0 },
      max_exercise_min: { date: '', value: 0 },
    },
    vo2_max_progression: {
      first: { date: '', value: 0 },
      peak: { date: '', value: 0 },
      current: { date: '', value: 0 },
    },
  },
  monthly: {},
  daily: [
    baseDay('2026-06-08', 8000),
    baseDay('2026-06-09', 9000),
    baseDay('2026-06-10', 9100),
  ],
  vo2_max: [],
  workouts: [
    baseWorkout('2026-06-08', 180),
    baseWorkout('2026-06-09', 200),
    baseWorkout('2026-06-10', 210),
  ],
  workout_summary: [],
  pushups: { unit: 'reps', weeks: [] },
  sleep: {
    nights: [],
    coverage_note: '',
    summary: {
      nights_with_data: 0,
      avg_total_hours: 0,
      min_total_hours: 0,
      max_total_hours: 0,
      stdev_hours: 0,
      avg_deep_pct: 0,
      avg_rem_pct: 0,
      avg_deep_hours: 0,
      avg_rem_hours: 0,
    },
  },
}

const latest: ImportedHealthExport = {
  export_date: '2026-06-11',
  timezone: 'America/Chicago',
  source: 'Apple Health / Apple Watch',
  generatedBy: 'normalizer regression test',
  period: { start: '2026-06-08', end: '2026-06-10' },
  dailyOverrides: [
    {
      date: '2026-06-10',
      steps: 10000,
      active_calories_kcal: null,
      resting_calories_kcal: 1800,
      walking_running_distance_km: 6,
      exercise_minutes: null,
      heart_rate_avg_bpm: null,
      resting_heart_rate_bpm: 61,
      hrv_sdnn_ms: null,
      walking_hr_avg_bpm: null,
      blood_oxygen_pct: null,
    },
  ],
  vo2Max: [
    { week_start: '2026-05-28', week_end: '2026-06-03', value_ml_kg_min: 36 },
    { week_start: '2026-06-04', week_end: '2026-06-10', value_ml_kg_min: 37 },
  ],
  workouts: [
    {
      start: '2026-06-10T12:00:00Z',
      end: '2026-06-10T12:30:00Z',
      activity_type: 'Other',
      duration_min: 30,
      distance_km: null,
      calories: 220,
    },
  ],
  bodyMeasurement: {
    weight_kg: 79,
    measured_date: '2026-06-10',
    note: 'test reading',
  },
  pushupsManualLog: {
    note: 'test pushup log',
    weekly: [],
  },
}

const normalized = normalizeHealthExport(base, latest)

assert.deepEqual(
  normalized.daily.map(day => day.date),
  ['2026-06-08', '2026-06-09', '2026-06-10'],
  'normalizer should carry base daily rows until the first imported override'
)

assert.equal(
  normalized.daily.find(day => day.date === '2026-06-09')?.steps,
  9000,
  'base daily row before the first override should be preserved'
)

assert.equal(
  normalized.daily.find(day => day.date === '2026-06-10')?.active_kcal,
  null,
  'imported partial day should preserve null active calories'
)

assert.deepEqual(
  normalized.workouts.map(workout => workout.date),
  ['2026-06-10', '2026-06-09', '2026-06-08'],
  'normalizer should carry base workouts until the first imported workout date'
)

assert.equal(
  normalized.workouts[0].type,
  'Pickleball',
  'imported Other workouts should normalize to Pickleball'
)

assert.equal(normalized.summary.period_totals.total_workouts, 3)
assert.equal(normalized.meta.period.days, 3)
