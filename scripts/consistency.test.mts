import assert from 'node:assert/strict'
import { buildConsistency } from '../lib/helpers.ts'
import type { DailyMetric, Workout } from '../lib/types.ts'

// Build a DailyMetric with sane defaults; only kcal/min/date matter for consistency.
function day(date: string, activeKcal: number | null, exerciseMin: number | null): DailyMetric {
  return {
    date,
    steps: 5000,
    active_kcal: activeKcal,
    basal_kcal: 1700,
    total_kcal: activeKcal === null ? null : activeKcal + 1700,
    distance_m: 4000,
    exercise_min: exerciseMin,
    stand_min: 10,
    flights_climbed: 5,
    daylight_sec: null,
    avg_hr: 80,
    resting_hr: 58,
    hrv_ms: 50,
    walking_hr: 100,
    respiratory_rate: 15,
    spo2_pct: 97,
  }
}

// Compact builder: spec {k, m}; defaults to an "active" day (k=500, m=40 → bucket ≥1).
type Spec = { k?: number | null; m?: number | null }
function mk(specs: Spec[]): DailyMetric[] {
  return specs.map((s, i) =>
    day(
      `2026-03-${String(i + 1).padStart(2, '0')}`,
      s.k === undefined ? 500 : s.k,
      s.m === undefined ? 40 : s.m,
    ),
  )
}

const A: Spec = {}                      // active (bucket ≥1)
const REST: Spec = { k: 0, m: 0 }       // genuine rest (not partial, bucket 0)
const PARTIAL: Spec = { k: null, m: null } // no data (transparent to streaks)

// 1) All active → full streak.
{
  const r = buildConsistency(mk([A, A, A, A, A]), [])
  assert.equal(r.currentStreak, 5, 'all-active current streak')
  assert.equal(r.longestStreak, 5, 'all-active longest streak')
  assert.equal(r.totalActiveDays, 5, 'all-active total')
  assert.equal(r.pctActive, 100, 'all-active pct')
}

// 2) A rest day breaks the streak.
{
  const r = buildConsistency(mk([A, A, A, REST, A, A]), [])
  assert.equal(r.longestStreak, 3, 'rest-break longest')
  assert.equal(r.currentStreak, 2, 'rest-break current')
  assert.equal(r.totalActiveDays, 5, 'rest-break total active')
}

// 3) A partial day is transparent — it doesn't break the run, but (being a
//    no-data day) it isn't itself counted as an active day. 3 + 2 active = 5.
{
  const r = buildConsistency(mk([A, A, A, PARTIAL, A, A]), [])
  assert.equal(r.longestStreak, 5, 'partial does not break, counts active days only')
  assert.equal(r.currentStreak, 5, 'current run survives the partial')
  assert.equal(r.totalActiveDays, 5, 'partial day not counted active')
  assert.equal(r.pctActive, 100, 'pct over non-partial days only')
}

// 4) Trailing partials don't reset the current streak.
{
  const r = buildConsistency(mk([A, A, A, PARTIAL, PARTIAL]), [])
  assert.equal(r.currentStreak, 3, 'trailing partials preserve current streak')
  assert.equal(r.longestStreak, 3, 'trailing partials longest')
}

// 5) Leading partials — streak starts cleanly after them.
{
  const r = buildConsistency(mk([PARTIAL, PARTIAL, A, A, A, A, A]), [])
  assert.equal(r.currentStreak, 5, 'leading partials current')
  assert.equal(r.longestStreak, 5, 'leading partials longest')
}

// 6) kcal present, exercise null → active via kcal signal.
{
  const r = buildConsistency(mk([{ k: 600, m: null }]), [])
  assert.equal(r.days[0].isPartial, false, 'one-signal day is not partial')
  assert.equal(r.days[0].bucket, 1, '600 kcal → bucket 1')
  assert.equal(r.currentStreak, 1, 'one-signal day extends streak')
}

// 7) exercise present, kcal null → active via min signal.
{
  const r = buildConsistency(mk([{ k: null, m: 30 }]), [])
  assert.equal(r.days[0].isPartial, false, 'min-only day is not partial')
  assert.equal(r.days[0].bucket, 1, '30 min → bucket 1')
  assert.equal(r.currentStreak, 1, 'min-only day extends streak')
}

// 8) Both null → partial, bucket 0, transparent.
{
  const r = buildConsistency(mk([PARTIAL]), [])
  assert.equal(r.days[0].isPartial, true, 'both-null is partial')
  assert.equal(r.days[0].bucket, 0, 'partial bucket 0')
  assert.equal(r.currentStreak, 0, 'lone partial → no streak')
  assert.equal(r.pctActive, 0, 'no non-partial days → 0%')
}

// 9) Bucket boundaries (the higher of the two signals wins).
{
  const r = buildConsistency(
    mk([{ k: 400, m: 0 }, { k: 399, m: 0 }, { k: 700, m: 0 }, { k: 0, m: 20 }, { k: 0, m: 19 }, { k: 450, m: 80 }]),
    [],
  )
  assert.equal(r.days[0].bucket, 1, '400 kcal → bucket 1')
  assert.equal(r.days[1].bucket, 0, '399 kcal → bucket 0')
  assert.equal(r.days[2].bucket, 2, '700 kcal → bucket 2')
  assert.equal(r.days[3].bucket, 1, '20 min → bucket 1')
  assert.equal(r.days[4].bucket, 0, '19 min → bucket 0')
  assert.equal(r.days[5].bucket, 3, 'max(kcal 1, min 3) → bucket 3')
}

// 10) workoutCount reflects logged workouts per date.
{
  const days = mk([A, A])
  const workouts: Workout[] = [
    { date: days[0].date, start: '', end: '', type: 'Walking', duration_min: 30, distance_m: 2000, calories: 150 },
    { date: days[0].date, start: '', end: '', type: 'Golf', duration_min: 60, distance_m: null, calories: 300 },
  ]
  const r = buildConsistency(days, workouts)
  assert.equal(r.days[0].workoutCount, 2, 'two workouts on day 0')
  assert.equal(r.days[1].workoutCount, 0, 'no workouts on day 1')
}

// 11) Empty input is safe.
{
  const r = buildConsistency([], [])
  assert.equal(r.currentStreak, 0)
  assert.equal(r.longestStreak, 0)
  assert.equal(r.totalActiveDays, 0)
  assert.equal(r.pctActive, 0)
  assert.equal(r.days.length, 0)
}

console.log('consistency.test: all assertions passed')
