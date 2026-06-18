# HANDOFF — Next Improvements

> For the next working session. State as of `ddeab30`: live site verified at 390/768/1280/1440, both themes, `npm run qa` green. Desktop masonry locked at 2 columns with no voids; full-width strips densified (Rest signals 4-col, prose capped); mobile Training/Rest now collapse. The two remaining high-leverage improvements are below.

---

## ✓ SHIPPED (ddeab30) — Mobile density + desktop densification

**Mobile (≤639px):** new `components/Collapsible.tsx` (CSS grid-rows `0fr→1fr`, hydration-safe, never-blank + reduced-motion guards). Training day-cards collapse (day 1 open, 2–7 tap-to-expand); Rest's Daily Protocol + Return-to-Train blocks collapse. iPad/desktop byte-identical (toggle `pointer-events:none`, chevron hidden, bodies forced open ≥640px, `aria-expanded`/`aria-controls`).
- Page **14,799 → 12,546px**; Training **3,008 → 1,330px**; Rest **1,405 → 829px**.
- Do/Avoid intentionally NOT collapsed (no single header → would add a desktop-visible label). Period left expanded (its 12 stat tiles are the payoff).

**Desktop (≥1024px):** killed the internal "wasted space" in the full-width strips — Rest Recovery Signals 2-col → 4-col (447px cells → 216px), and capped stretched prose (guardrails 910→591px, protocol 790→558px, rationale → 72ch).

## 1. Freshness stamp — "synced N days ago" (the alive signal)

**Problem:** The site's whole premise is "alive," but nothing on screen says how fresh the data is. `meta.generated_at` (export date) is only in the footer, formatted as a date.

**Approach:**
- Small mono-label chip in the hero or HealthCommandStrip: `SYNCED 8 DAYS AGO` derived from `data.meta.generated_at` vs build time.
- Compute days-at-build-time in `lib/site.ts` or page.tsx (server, SSG) — NOT client `Date.now()` (hydration mismatch). It's accurate to the last deploy, which is exactly the honest claim.
- Color it: ≤7 days `--accent-green`, ≤21 `--accent-amber`, older `--accent-coral` — gentle pressure to run `npm run refresh`.
- ~20 lines. Zero risk. Ship same day.

## 2. Hero "2-second wow" — the signature reveal (ROADMAP H1.5)

**Problem:** The hero is strong but static. The first 2 seconds are the screenshot moment and the thing people remember.

**Approach:** prototype all three on a branch, Boyd picks ONE:
- **A:** the RHR/VO₂ sparklines draw themselves left→right on load (~1.2s, Web Animations API — NOT CSS animation, which `prefers-reduced-motion` UA styles suppress even with `!important`).
- **B:** hero numerals count up staggered (VO₂ → steps → workouts) — `CountUp.tsx` already exists, just needs orchestrated delays on first load only.
- **C:** wordmark + tagline resolve (opacity + letter-spacing ease, newspaper-style).

**Guardrails:** reduced-motion users get the final state instantly; zero layout shift; the `@media (scripting:none)` never-blank guard must keep covering it. **The hero is sacred — preview branch + Boyd sign-off before `main`.**

---

## Also on the shelf (smaller, do anytime)
- `lib/svg-path.ts`: dedupe the identical cubic-Bezier path builders in `Sparkline.tsx` (`buildPath`) and `VO2Chart.tsx` (`smoothLine`); replace `SleepAnalysis.tsx`'s brittle join/split `linePath`.
- Add `import 'server-only'` to `lib/imported-health-export.ts` (emit it from `scripts/convert-export.mjs` — the file is auto-generated) so the 100KB data module can never reach a client bundle.

## How to verify any of it
`npm run qa` (lint · 3 test suites · typecheck · build · audit · smoke) must pass before push. Then check 390×844 / 768×1024 / 1280×900 / 1440×900 in both themes. Push `main` → Vercel deploys.
