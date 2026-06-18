// scripts/merge-export.mjs
// Combines two legacy-schema Apple Health exports into one continuous file so a
// newer (shorter) export can refresh + extend an older one without losing the
// earlier history.
//
// Run:  node scripts/merge-export.mjs <old.json> <new.json> <out.json> [cutoff]
//
// Rules (cutoff defaults to the earliest date in NEW's daily series):
//   - daily series + workouts → RANGE-CUT: OLD owns dates < cutoff, NEW owns
//     dates >= cutoff (NEW is dense/authoritative for its range).
//   - vo2Max + sleep → PER-DATE OVERLAY: union by key, NEW wins on collision,
//     OLD kept where NEW is silent (these are sparse/episodic in newer exports;
//     a range-cut would blow holes — e.g. only a few detailed sleep nights).
//   - meta: period widened (old start, new end), export stamp advanced.
import { readFileSync, writeFileSync } from 'node:fs'

const [, , OLD_P, NEW_P, OUT_P, CUTOFF_ARG] = process.argv
if (!OLD_P || !NEW_P || !OUT_P) { console.error('usage: node scripts/merge-export.mjs <old.json> <new.json> <out.json> [cutoff]'); process.exit(1) }
const old = JSON.parse(readFileSync(OLD_P, 'utf8'))
const neu = JSON.parse(readFileSync(NEW_P, 'utf8'))
const newDailyDates = []
for (const k of Object.keys(neu.daily ?? {})) for (const p of neu.daily[k]?.data ?? []) newDailyDates.push(p.date)
const cutoff = CUTOFF_ARG || newDailyDates.sort()[0]
if (!cutoff) throw new Error('No cutoff and NEW has no daily data')

const sortBy = (arr, f) => arr.sort((a, b) => (a[f] < b[f] ? -1 : a[f] > b[f] ? 1 : 0))
const mergeData = (o = [], n = [], f = 'date') => sortBy(o.filter(r => r[f] < cutoff).concat(n.filter(r => r[f] >= cutoff)), f)
const overlayData = (o = [], n = [], f = 'date') => { const m = new Map(); for (const r of o) m.set(r[f], r); for (const r of n) m.set(r[f], r); return sortBy([...m.values()], f) }
const mergeSeries = (o, n) => ({ ...(o ?? {}), ...(n ?? {}), data: mergeData(o?.data, n?.data) })

const out = { ...old }
out.daily = {}
for (const k of new Set([...Object.keys(old.daily ?? {}), ...Object.keys(neu.daily ?? {})])) out.daily[k] = mergeSeries(old.daily?.[k], neu.daily?.[k])
if (old.vo2Max || neu.vo2Max) out.vo2Max = { ...(old.vo2Max ?? {}), ...(neu.vo2Max ?? {}), data: overlayData(old.vo2Max?.data, neu.vo2Max?.data, 'date') }
if (old.sleep || neu.sleep) out.sleep = { ...(old.sleep ?? {}), ...(neu.sleep ?? {}), data: overlayData(old.sleep?.data, neu.sleep?.data, 'wake_date') }
if (old.workouts || neu.workouts) out.workouts = { ...(old.workouts ?? {}), ...(neu.workouts ?? {}), data: mergeData(old.workouts?.data, neu.workouts?.data, 'date') }
for (const k of ['bodyMeasurements', 'gaitMetrics']) if (old[k] || neu[k]) out[k] = mergeSeries(old[k], neu[k])
out.meta = {
  ...old.meta, ...neu.meta,
  exported_at: neu.meta?.exported_at ?? old.meta?.exported_at,
  period: { start: old.meta?.period?.start ?? neu.meta?.period?.start, end: neu.meta?.period?.end ?? old.meta?.period?.end },
  notes: { ...(old.meta?.notes ?? {}), ...(neu.meta?.notes ?? {}) },
  sleep_added: (old.meta?.sleep_added ?? false) || (neu.meta?.sleep_added ?? false),
  workouts_complete: Boolean((old.meta?.workouts_complete ?? true) && (neu.meta?.workouts_complete ?? true)),
}
writeFileSync(OUT_P, JSON.stringify(out, null, 2))
console.log(`merged @ ${cutoff} → ${out.meta.period.start}→${out.meta.period.end} | daily=${out.daily.steps?.data.length} workouts=${out.workouts?.data.length} sleep=${out.sleep?.data.length} vo2=${out.vo2Max?.data.length}`)
