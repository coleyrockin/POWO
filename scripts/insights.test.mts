import assert from 'node:assert/strict'
import { pearsonR, stddev, joinSleepToDaily, pairDrop, vo2Recent, analyzeSleep } from '../lib/helpers.ts'
import type { DailyMetric, HealthData, SleepNight } from '../lib/types.ts'

// ─── pearsonR ───────────────────────────────────────────────
{
  assert.equal(pearsonR([1, 2, 3], [2, 4, 6]), 1, 'perfect positive → 1')
  assert.equal(pearsonR([1, 2, 3], [6, 4, 2]), -1, 'perfect negative → -1')
  assert.equal(pearsonR([1, 2, 3, 4], [1, 1, 1, 1]), 0, 'zero-variance y → 0 (no div-by-zero)')
  assert.equal(pearsonR([5], [5]), 0, 'n<2 → 0')
  assert.equal(pearsonR([], []), 0, 'empty → 0')
  // Uses the shorter length when mismatched
  const r = pearsonR([1, 2, 3, 100], [2, 4, 6])
  assert.ok(Math.abs(r - 1) < 1e-9, 'mismatched lengths use the shared prefix → still perfect +1')
  // Known moderate value: r should be in (0,1)
  const m = pearsonR([1, 2, 3, 4, 5], [2, 1, 4, 3, 5])
  assert.ok(m > 0 && m < 1, 'imperfect positive is strictly between 0 and 1')
}

// ─── stddev (population) ────────────────────────────────────
{
  assert.equal(stddev([2, 4, 4, 4, 5, 5, 7, 9]), 2, 'classic population stddev fixture → 2')
  assert.equal(stddev([5, 5, 5]), 0, 'no spread → 0')
  assert.equal(stddev([42]), 0, 'n<2 → 0')
}

// ─── joinSleepToDaily ───────────────────────────────────────
function night(date: string, total: number): SleepNight {
  return { date, total_sleep_hours: total, core_hours: total * 0.6, deep_hours: total * 0.15, rem_hours: total * 0.25, deep_pct: 15, rem_pct: 25 }
}
function day(date: string, hrv: number | null): DailyMetric {
  return {
    date, steps: 5000, active_kcal: 500, basal_kcal: 1700, total_kcal: 2200, distance_m: 4000,
    exercise_min: 40, stand_min: 10, flights_climbed: 5, daylight_sec: null, avg_hr: 80,
    resting_hr: 58, hrv_ms: hrv, walking_hr: 100, respiratory_rate: 15, spo2_pct: 97,
  }
}
{
  const data = {
    sleep: { nights: [night('2026-04-01', 8), night('2026-04-02', 6), night('2026-04-09', 7)] },
    daily: [day('2026-04-02', 55), day('2026-04-03', 48)], // no 2026-04-10 → third night drops
  } as unknown as HealthData

  const pairs = joinSleepToDaily(data, 1)
  assert.equal(pairs.length, 2, 'two nights have a next-day match; the third (Apr 9 → Apr 10 missing) drops')
  assert.equal(pairs[0].night.date, '2026-04-01')
  assert.equal(pairs[0].next.date, '2026-04-02', 'night Apr 1 joins to daily Apr 2 (offset +1)')
  assert.equal(pairs[0].next.hrv_ms, 55)
  assert.equal(pairs[1].night.date, '2026-04-02')
  assert.equal(pairs[1].next.date, '2026-04-03')

  // offset 0 = same-day join
  const same = joinSleepToDaily(data, 0)
  assert.equal(same.length, 1, 'offset 0: only Apr 2 night matches Apr 2 daily')
  assert.equal(same[0].night.date, '2026-04-02')
  assert.equal(same[0].next.date, '2026-04-02')
}

// ─── pairDrop: lock-step alignment (regression for the correlation pairing bug) ───
{
  // A null on EITHER side must drop the whole pair so xs[i] always matches ys[i].
  const items = [{ a: 1, b: 10 }, { a: 2, b: null }, { a: 3, b: 30 }, { a: null, b: 40 }]
  const { xs, ys } = pairDrop(items, i => i.a, i => i.b)
  assert.deepEqual(xs, [1, 3], 'pairDrop keeps only rows where both sides are non-null (x side)')
  assert.deepEqual(ys, [10, 30], 'pairDrop keeps y aligned to x — no index drift from one-sided filtering')
  // The bug being guarded: filtering only ys would have yielded ys=[10,30,40] misaligned with xs.
}

// ─── vo2Recent: empty input does not crash ───
{
  const r = vo2Recent([])
  assert.equal(r.peak.value, 0, 'vo2Recent([]) → neutral peak, no reduce-of-empty crash')
  assert.equal(r.deltaPct, 0, 'vo2Recent([]) → 0% delta (not NaN)')
}

// ─── analyzeSleep: empty nights do not crash ───
{
  const data = {
    sleep: {
      nights: [],
      coverage_note: '',
      summary: { nights_with_data: 0, avg_total_hours: 0, min_total_hours: 0, max_total_hours: 0, stdev_hours: 0, avg_deep_pct: 0, avg_rem_pct: 0, avg_deep_hours: 0, avg_rem_hours: 0 },
    },
  } as unknown as HealthData
  const s = analyzeSleep(data)
  assert.equal(s.bestNight.total_sleep_hours, 0, 'analyzeSleep with no nights → neutral bestNight, no crash')
  assert.equal(s.worstNight.total_sleep_hours, 0, 'analyzeSleep with no nights → neutral worstNight')
}

console.log('insights.test: all assertions passed')
