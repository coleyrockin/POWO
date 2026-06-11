# HANDOFF — Next 3 Improvements

> For the next working session. State as of `de854cd`: live site verified at 390/768/1100/1440, both themes, `npm run qa` green, desktop masonry locked at 2 columns with no voids. These are the three highest-leverage improvements, in order.

---

## 1. Mobile density — collapse Training & Rest day cards (biggest UX win)

**Problem (measured):** On iPhone 390px the Training section is **3,008px tall** (7 stacked day-cards at 276–460px each) — about 20% of the entire 14,787px page. Rest's Daily Protocol tiles add another ~860px stacked. Scrolling fatigue is the #1 remaining mobile issue.

**Approach (mobile-only, ≤639px; iPad/desktop untouched):**
- In `components/WorkoutRecommendation.tsx`, render each day card collapsed by default on mobile: day number + title + zone chip + duration visible (~64px row); tap expands the detail block.
- Use a state toggle with `aria-expanded`, animate height via the CSS `grid-template-rows: 0fr → 1fr` trick (no layout-shift jank, no JS measurement).
- Same treatment for the three Daily Protocol tiles in `components/RestRecommendation.tsx` (Sleep window / Do / Avoid).
- Target: Training <1,000px collapsed; full page ~14,800px → ~11,500px.

**Guardrail:** this changes mobile presentation — show Boyd a preview before pushing.

## 2. Freshness stamp — "synced N days ago" (the alive signal)

**Problem:** The site's whole premise is "alive," but nothing on screen says how fresh the data is. `meta.generated_at` (export date) is only in the footer, formatted as a date.

**Approach:**
- Small mono-label chip in the hero or HealthCommandStrip: `SYNCED 8 DAYS AGO` derived from `data.meta.generated_at` vs build time.
- Compute days-at-build-time in `lib/site.ts` or page.tsx (server, SSG) — NOT client `Date.now()` (hydration mismatch). It's accurate to the last deploy, which is exactly the honest claim.
- Color it: ≤7 days `--accent-green`, ≤21 `--accent-amber`, older `--accent-coral` — gentle pressure to run `npm run refresh`.
- ~20 lines. Zero risk. Ship same day.

## 3. Hero "2-second wow" — the signature reveal (ROADMAP H1.5)

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
`npm run qa` (lint · 3 test suites · typecheck · build · audit · smoke) must pass before push. Then check 390×844 / 768×1024 / 1440×900 in both themes. Push `main` → Vercel deploys.
