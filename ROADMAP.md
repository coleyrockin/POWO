# POWO — Roadmap

> **Status: In Progress** — The foundation is solid and live. The site works, looks good, and has real data. We're building toward *Alive* (it stays current automatically) and *Story* (the arc of the data is told, not just displayed).

---

## North Star

> The most beautiful proof of work a human body can have — a site that is *alive* (it updates), *a story* (not just numbers), and *crafted* to a level where every screen is worth screenshotting.

If POWO is open on a phone, the reaction should be: *"wait, my health data could look like THAT?"* — then, scrolling: *"…and it actually tells me something."*

---

## Shipped

| Feature | What shipped |
|---|---|
| 6-month dataset | 183 days · 214 workouts · 57 sleep nights · full RHR/HRV arc via `scripts/convert-export.mjs` |
| One-command refresh | `npm run refresh` — new export → validated TS module → qa gate → ready to push |
| Never-blank guard | `@media (scripting:none)` override — content visible even if JS is blocked |
| Editorial type system | Bebas Neue · DM Mono · DM Sans · Newsreader serif for narrative voice |
| Hybrid palette | Calm neutral body + vibrant hero KPI strip |
| 17 sections | Hero · Explore · Period Summary · WoW · Insights · Heatmap · Daily table · VO₂ · Cardiac · Sleep · Workouts · Pushups · Rest rec · Training rec · Awards · Share cards |
| Sleep redesign | Duration + timing model (57 nights, avg ~8.7h, bedtime/wake consistency) |
| Interactive charts | Keyboard-scrubable SVG charts with chart-cursor hover tooltips |
| Light/dark themes | Both ship-quality; system preference respected |
| Share cards | OG image routes for link previews |
| QA gate | `npm run qa` — lint · test · typecheck · build · audit · smoke (11 routes) |
| Desktop layout | 1200px editorial column cap, centered, box-shadow framing |

---

## Now

The next things to build, in priority order.

### PWA — installable (H1.3)
POWO should live on Coley's home screen and open instantly, everywhere.
- Wire `app/manifest.ts` (already present) with `start_url`, `display: standalone`, icons
- Service worker via workbox: StaleWhileRevalidate for the SSG shell, NetworkFirst for API card routes
- Test: iOS Safari "Add to Home Screen" + Chrome DevTools → Application → Service Workers

### Milestone auto-cards (H1.4)
When a new record is set — VO₂ peak, RHR low, longest streak, distance milestone — it should surface.
- Detect via `summary.best_days` comparison on each `npm run refresh`
- Auto-generate a share card for the milestone
- Subtle "🏆 new best" beat on the relevant section
- Seed: `app/api/cards/[variant]` already handles card generation

### The hero "2-second wow" (H1.5)
**The first impression.** Currently the hero is strong but static. One unforgettable reveal beat.

Three options to prototype (on a branch — show Boyd before touching `main`):
- **A:** RHR line draws itself left→right on load (~1.2s, Web Animations API)
- **B:** Big numerals count up from 0 (staggered: RHR → VO₂ → workouts)
- **C:** Wordmark + tagline resolve (opacity + letter-spacing, newspaper-style)

Pick one. Do it once. Do it right.

---

## Next

Building the soul of the site.

### AI Coach — Vercel AI Gateway (H2.2)
Replace the rule-based coach text with a real model. Two modes:

**Weekly narrative** (generated on `npm run refresh`, cached as static copy):
- Input: last 7 days + 30-day context (steps, RHR, HRV, sleep, workouts)
- Output: 3–5 sentences in Newsreader voice — honest, specific
- Stored as `lib/coach-narrative.ts`, zero live server cost

**"Ask your data"** (live streaming):
- Route: `app/api/coach/route.ts`
- Streamed via Vercel AI Gateway, stateless, zero-retention
- UX: small "Ask" button → text field → streamed answer in Newsreader italic

### Story Mode — scrollytelling (H2.1)
The data has a real arc: Dec–Jan flatline → Feb inflection → the spring climb. Make people feel it.
- Route: `/story` — separate from the main dashboard
- 4 beats with animated charts and Newsreader prose
- The dashboard stays the "instrument" view; Story Mode is the film

### Training Load — CTL/ATL/TSB (H2.3)
The readiness model athletes actually use.
- CTL (fitness): 42-day EMA of training stress
- ATL (fatigue): 7-day EMA
- TSB (form): CTL − ATL — positive = fresh, negative = fatigued
- Rendered as a 3-line chart with landmark annotations at TSB peaks/valleys

### Annotations (H2.4)
Mark real life on the timeline — a tournament, a trip, a rest week — so the charts have context.
- Source: `lib/annotations.ts` (hand-authored JSON, merged by converter)
- Renders as dashed vertical lines on all time-series charts

---

## Later

Good ideas, not the current focus.

| Feature | Why it's later |
|---|---|
| Workout route maps (H3.1) | Need GPS in the export; stunning when it ships |
| HR-zone breakdowns (H3.2) | Requires per-workout interval HR data |
| Mobility section (H3.3) | Walking speed/steadiness already in export, just not displayed |
| Sleep stages (H3.4) | Waiting on a re-export with Core/Deep/REM segments; architecture supports it |
| Season in Review (H3.5) | The shareable artifact — "Coley's Spring '26" |
| Apple Shortcut auto-sync (H3.6) | Shortcut → POST to Vercel webhook → auto-deploy; the zero-touch endgame |
| Animated share cards (H3.7) | Cards that move; canvas export |
| Domain (H1.6) | `powo.fit` is the leading candidate; not urgent |

---

## Won't Build

Decisions that are closed.

| What | Why not |
|---|---|
| Multi-user / accounts / auth | This is Coley's site. Not a platform. |
| Every metric on screen | Ruthless curation is the whole point. |
| Heavy client frameworks or state libs | Static-first is a feature, not a constraint. |
| Faking data or hiding gaps | The Dec–Jan sparse period is part of the story. |
| Generic health advice | The coach speaks to Coley's data only, never "eat better, sleep more." |
| SaaS-ification / monetization | Non-goal. |

---

## Decisions made

| Question | Answer |
|---|---|
| First horizon | H1 — Alive & unbreakable |
| Manual refresh | ✅ Shipped — `npm run refresh` |
| Never-blank guard | ✅ Shipped — `@media (scripting:none)` |
| Apple Shortcut auto-sync | Build it later (H3.6) |
| AI Coach | Yes — Vercel AI Gateway, streaming, Newsreader voice |
| Story Mode | Dedicated `/story` route, not folded into main |
| Domain | Undecided — `powo.fit` leading candidate |
| Unknown Activity workouts | Relabeled → Pickleball |
| Sleep display | Duration + timing only; stages on next re-export |
| Gait / walking-speed | Parse-tolerant in converter, not displayed this pass |

---

## Engineering guardrails

- **`npm run qa` before every push.** No exceptions.
- **Visual verify**: iPhone 390 / iPad 768 / desktop 1440, both themes, after any layout change.
- **The hero is sacred.** H1.5 gets a preview branch and Boyd sign-off before it touches `main`.
- **Protect the data pipeline**: `convert-export.mjs` → `imported-health-export.ts` → `normalize-health-export.ts`. Pipeline changes need the sanity check (183 days, 214 workouts, 57 sleep nights, VO₂ latest 38.89) + all three test suites green.
- **Static-first**: new server work goes in thin `app/api/*` routes. The page stays SSG.
- **Tests are required for data changes**: any normalizer change that alters a computed value updates the test expectation in the same commit.
