// scripts/refresh-health.mjs
// One-command health refresh. Finds the newest export in the iCloud AI folder
// (or takes an explicit path), detects its schema, adapts PULSE → legacy,
// merges it into a growing baseline (kept in iCloud, never committed — raw
// health data stays private), and regenerates lib/imported-health-export.ts.
// Sanity guards in convert-export.mjs fail the run on impossible values.
//
// Run:  npm run refresh            (auto-find newest export)
//       npm run refresh -- <path>  (explicit file)
// Then: npm run qa  (wired automatically by the npm script), then git push.
import { readFileSync, copyFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import path from 'node:path'

const AI_DIR = '/Users/boydroberts/Library/Mobile Documents/com~apple~CloudDocs/AI'
const BASELINE = path.join(AI_DIR, 'powo-baseline.json')
const HERE = path.dirname(fileURLToPath(import.meta.url))
const TMP = tmpdir()

const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(HERE, script), ...args], { stdio: 'inherit' })
  if (r.status !== 0) { console.error(`\n✗ ${script} failed`); process.exit(r.status ?? 1) }
}
const isHealthExport = o => o?.schema === 'PULSE.health.v1' || (o?.meta && o?.daily)
const endDate = o => o?.period?.end ?? o?.meta?.period?.end ?? '' // latest data date

// 1) Resolve the source export ────────────────────────────────────────────
// Rank by the data's latest date (not file mtime — iCloud sync rewrites mtimes,
// and the old baseline file is also a valid export we must not pick over a newer
// one). Newest data wins; mtime only breaks ties.
const argPath = process.argv[2]
let src
if (argPath) {
  src = { fp: argPath, json: JSON.parse(readFileSync(argPath, 'utf8')) }
} else {
  const cands = []
  for (const f of readdirSync(AI_DIR)) {
    const fp = path.join(AI_DIR, f)
    if (!f.endsWith('.json') || fp === BASELINE) continue
    try { const json = JSON.parse(readFileSync(fp, 'utf8')); if (isHealthExport(json)) cands.push({ fp, json, mtime: statSync(fp).mtimeMs }) } catch { /* skip non-JSON */ }
  }
  cands.sort((a, b) => (endDate(b.json).localeCompare(endDate(a.json))) || (b.mtime - a.mtime))
  src = cands[0]
  if (src) console.log(`▸ ${cands.length} export(s) found; newest data ends ${endDate(src.json)}`)
}
if (!src) { console.error(`No health export found in ${AI_DIR}`); process.exit(1) }
console.log(`▸ source: ${path.basename(src.fp)}`)

// 2) Adapt PULSE → legacy (legacy exports pass through) ─────────────────────
let legacyNew = src.fp
if (src.json.schema === 'PULSE.health.v1') {
  legacyNew = path.join(TMP, 'powo-adapted.json')
  run('adapt-pulse.mjs', [src.fp, legacyNew])
}

// 3) Merge into the baseline (seed it on first ever run) ─────────────────────
if (!existsSync(BASELINE)) {
  console.warn(`⚠ no baseline at ${BASELINE} — seeding from this export alone (older history will be absent until a wider export is merged)`)
  copyFileSync(legacyNew, BASELINE)
}
const merged = path.join(TMP, 'powo-merged.json')
run('merge-export.mjs', [BASELINE, legacyNew, merged])
copyFileSync(BASELINE, `${BASELINE}.bak`) // keep one rollback copy
copyFileSync(merged, BASELINE)

// 4) Convert baseline → committed module (sanity guards run here) ────────────
run('convert-export.mjs', [BASELINE])

const meta = JSON.parse(readFileSync(BASELINE, 'utf8')).meta
console.log(`\n✓ refreshed → ${meta.period.start} → ${meta.period.end}. QA runs next; then git push to deploy.`)
