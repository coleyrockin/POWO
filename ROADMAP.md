# POWO — Roadmap to the Best Personal Health Site Ever

> **What this is.** POWO (*Proof of Workout*) is Coley's living record of training — Apple Health turned into something cinematic, honest, and worth sharing. Not a portfolio piece, not a generic dashboard. A trophy case for a real body of work, that tells the story of the climb.

This document is the **vision and execution plan**.

---

## North Star

> **The most beautiful proof of work a human body can have** — a site that is *alive* (it updates), *a story* (not just numbers), and *crafted* to a level where every screen is worth screenshotting.

If POWO is open on a phone, the reaction should be: *"wait, my health data could look like THAT?"* — and then, scrolling, *"…and it actually tells me something."*

---

## Design Principles

1. **Editorial, not dashboard.** A magazine about one athlete, rendered from data. Calm body, vibrant signature moments, a real narrative voice.
2. **Color is signal, not decoration.** Neutrals carry the page; accent = meaning (peak, good/bad, the hero metric). The hero KPI strip is the one allowed splash.
3. **Honest by default.** Show the gaps (the Dec–Jan ramp), the partial days, the naps. Truth is more impressive than a polished lie.
4. **Fast and unbreakable.** Static-first, <1s, content visible even if JS never runs. Motion is a garnish, never a dependency.
5. **Personal, single-subject.** This is Coley's. No accounts, no multi-tenant, no SaaS-ification. Depth over breadth.
6. **Every section earns its place.** If it's not screenshot-worthy or insight-worthy, cut it.

---

## The Three Pillars

| Pillar | Meaning | What it grows from (already built) |
|---|---|---|
| **ALIVE** | It updates itself; it shows "now," not a frozen snapshot. | `npm run refresh` → `convert-export.mjs` → `normalizeHealthExport` |
| **STORY** | A guided narrative of the journey, in a real voice. | Newsreader serif coach voice, `buildInsights`, the RHR 79→64 / VO₂ 33→40 arc |
| **CRAFT** | World-class polish, motion, identity, share. | Hybrid palette, chart-cursor, share-card routes, capped editorial column |

---

## Where We Are (the foundation)

**Shipped and live** (`proof-of-workout-next.vercel.app`):

### Data
- **6-month dataset** (Dec 2 → Jun 2, 183 days): 214 workouts · 57 sleep nights · 29 VO₂ readings · full RHR/HRV arc
- **Reusable converter**: `npm run refresh` = new export → validated TS module → `npm run qa` → ready to push
- **RHR story**: Dec–Jan avg **79 bpm** → Feb–Jun avg **63 bpm**. VO₂ latest **38.89**, peak **39.98** (May 17).

### Sections (17 total)
Hero · Explore (windowed + vs-prior) · Period Summary · Week-over-week · Insights (correlations) · Streak/consistency heatmap · Daily table · VO₂ · Cardiac · **Sleep (duration/timing, 57 nights)** · Workouts · Pushups · Rest recommendation · Training recommendation · Awards · Share cards

### System
- **Editorial typography**: Bebas Neue (numerals) · DM Mono (labels) · DM Sans (body) · **Newsreader** (serif narrative voice)
- **Hybrid palette**: neutral-dark editorial body + vibrant hero KPI sparkline strip
- **Themes**: light + dark, both ship-quality
- **Robustness**: `@media (scripting:none)` never-blank guard — content visible even if JS is blocked
- **A11y**: 40px+ touch targets, reduced-motion, keyboard-nav, focus rings
- **Craft**: keyboard-scrubable SVG charts, chart-cursor hover tooltips, 1200px editorial column cap, OG/share-card image routes, Dec–Jan "winter baseline" story beat

### Gate
`npm run qa` (lint · test · typecheck · build · audit:prod · smoke 11 routes) → green → `push main` → Vercel auto-deploys.

**This is already top-tier.** Everything below is great → unforgettable.

---

## Horizon 1 — Alive & Unbreakable *(in progress)*

The goal: it stops being a snapshot and starts being *Coley's app*.

| # | Item | Status | Notes |
|---|---|---|---|
| H1.1 | One-command refresh | ✅ **Shipped** | `npm run refresh` — ingests new export, runs gate, ready to push |
| H1.2 | Never-blank render | ✅ **Shipped** | `@media (scripting:none)` override on all `opacity:0` entrance animations |
| H1.3 | Installable PWA | ⬜ Next | Service worker + offline cache; `app/manifest.ts` already present — wire `next-pwa` or hand-roll, cache the SSG shell |
| H1.4 | Milestone auto-cards | ⬜ Next | Detect new records (VO₂ peak, RHR low, streak, distance); auto-generate share card + subtle "🏆 new best" in-page beat. *Seed: `app/api/cards/[variant]` + `summary.best_days`* |
| H1.5 | The hero "2-second wow" | ⬜ Prototype first | The signature first-impression moment — wordmark resolving, the climb drawing itself. **Show Boyd a preview branch before touching `main`.** |
| H1.6 | Identity & domain | ⬜ Optional | Real POWO favicon/app icon; claim a domain (`powo.fit`?); OG card that looks like a magazine cover |

### H1.3 PWA — technical notes
- `next-pwa` (workbox) or manual `app/sw.ts` + `next.config` service worker registration
- Cache strategy: **StaleWhileRevalidate** for the SSG shell; **NetworkFirst** for the API card routes
- `app/manifest.ts` → add `start_url`, `display: "standalone"`, `theme_color: "#000"`, 192/512 icons
- Test: Chrome DevTools → Application → Service Workers; install on iOS Safari ("Add to Home Screen")

### H1.5 Hero wow — design brief
The hero is sacred. Approach: **a single timed sequence, reduced-motion safe, no layout shift.**
- Option A: RHR line draws itself left→right on load (Web Animations API, ~1.2s, easing `ease-out`)
- Option B: big numerals count up from 0 (stagger: RHR, then VO₂, then workouts)
- Option C: wordmark + tagline resolve (opacity + letter-spacing, newspaper-style)
- **Prototype all three on a branch. Boyd picks. Then ship.**

---

## Horizon 2 — Tell the Story *(the soul)*

The data has a genuine arc. Make people *feel* it.

### H2.1 — Story Mode (scrollytelling)
A guided narrative: winter baseline → the turn → the spring climb. Charts animate to each beat — Pudding/NYT-style. The main dashboard stays the "instrument" view; Story Mode is the "film."

- Route: `/story` (new page, not a modal)
- Beats: **1)** Dec–Jan flatline + baseline stats, **2)** Feb inflection (RHR starts dropping), **3)** Mar–Apr the climb (VO₂ rising, workouts stacking), **4)** May–Jun the new normal
- Each beat: full-bleed chart animation + 2–3 sentence Newsreader prose
- Seed: existing `buildInsights` narrative copy + `monthly` data already bucketed

### H2.2 — AI Coach via Vercel AI Gateway *(high priority)*

Replace the rule-based coach takeaway with a streaming model. Two modes:

**Weekly narrative** (generated on `npm run refresh`, cached as static copy):
- Input: last 7 days of daily metrics + previous 30-day context window (steps, RHR, HRV, sleep, workouts)
- Output: 3–5 sentence coach summary in Newsreader voice — honest, specific, not generic
- Cache: write to `lib/coach-narrative.ts` as a static string; zero live server cost

**"Ask your data"** (live, serverless):
- Route: `app/api/coach/route.ts` — streaming Vercel AI Gateway endpoint
- Input context: `healthData` summary object (sanitized, no PII beyond what's already public on the page)
- UX: small fixed "Ask" button, expands to a text field, streamed response in Newsreader italic
- Model: Vercel AI Gateway (provider-agnostic; prefer `claude-sonnet` for voice fidelity)
- Zero-retention: no conversation history stored; each question is stateless
- Guardrails: system prompt enforces "health-data coach" persona, never medical advice

### H2.3 — Training Load (CTL/ATL/TSB)
The model athletes actually trust. Turns exercise minutes + HR into a readiness curve.
- CTL (fitness): 42-day EMA of daily training stress
- ATL (fatigue): 7-day EMA
- TSB (form): CTL − ATL (positive = fresh, negative = fatigued)
- Visualized as a 3-line chart, landmark annotations auto-added at TSB peaks/valleys
- Seed: `daily.exercise_min` + `daily.hrv_ms` + workout durations already normalized

### H2.4 — Annotations & Events
Mark real life on the timeline. An injury, a tournament, a road trip — context that makes the charts make sense.
- Source: `lib/annotations.ts` (hand-authored JSON, merged by converter)
- UI: vertical dashed line on all time-series charts with a hover tooltip
- Schema: `{ date: string; label: string; type: 'event'|'injury'|'milestone' }`

---

## Horizon 3 — Depth & Delight *(ambitious)*

| # | Feature | Notes |
|---|---|---|
| H3.1 | Workout route maps | GPS traces from export rendered as glowing SVG paths. The Strava moment — but ours. |
| H3.2 | HR-zone breakdowns | Per-workout time-in-zone + trend chart. Requires HR data per workout interval. |
| H3.3 | Mobility section | Walking speed, steadiness, gait asymmetry — already in export, just not displayed. |
| H3.4 | Sleep stages | When Coley re-exports with Core/Deep/REM: converter extends, Sleep section gains stage chart on top of duration view. The architecture already supports it. |
| H3.5 | Season in Review | Generated animated recap artifact — "Coley's Spring '26". The shareable moment. |
| H3.6 | Live Apple Shortcut sync | Shortcut auto-exports → POSTs to a Vercel route → triggers regeneration. Zero-touch freshness. |
| H3.7 | Video/animated share | Share cards that move (MP4/GIF via canvas). The thing that gets screenshotted AND shared. |

---

## Signature Moments (the things people remember)

1. **The hero wow** — the 2-second reveal. First impression, last memory. (H1.5)
2. **The climb** — Story Mode walking RHR 79→64 / VO₂ 33→40, beat by beat. (H2.1)
3. **"Ask your data"** — the AI coach answering *"why did my HRV dip in March?"* in Coley's voice. (H2.2)
4. **New best** — milestone cards that auto-appear and beg to be shared. (H1.4)
5. **Route maps** — runs and walks glowing on the page. (H3.1)

---

## Visual Design System

### Typography
| Role | Font | Usage |
|---|---|---|
| Display numerals | **Bebas Neue** | Hero KPIs, section big numbers, awards |
| Monospace labels | **DM Mono** | Axis labels, timestamps, data tags, button text |
| Body | **DM Sans** | Prose, descriptions, UI chrome |
| Narrative voice | **Newsreader** | Coach text, story beats, pull quotes — *always italic* |

### Color tokens (dark theme)
- `--color-bg` `#050505` — page void
- `--color-card` `#0d0d0d` — section background
- `--color-border` `rgba(255,255,255,0.06)` — hairlines
- `--color-white` `#f5f5f5` — primary text / KPI numerals
- `--color-mid` `rgba(255,255,255,0.5)` — secondary labels
- `--color-dim` `rgba(255,255,255,0.25)` — tertiary / disabled
- `--accent-blue` `#0a84ff` — primary interactive / Explore
- `--accent-teal` `#30d158` — RHR / recovery good
- `--accent-purple` `#bf5af2` — HRV
- `--accent-amber` `#ff9f0a` — calories / effort
- `--accent-coral` `#ff453a` — alert / bad direction
- `--accent-green` `#34c759` — positive delta

### Motion principles
- Entrance: `opacity: 0 → 1, y: 8 → 0`, `delay: i * 0.04s`, `duration: 0.3s` — staggered, never jarring
- Chart draws: left-to-right SVG path animation via `pathLength` or Web Animations API
- `prefers-reduced-motion`: all animations → instant; never suppress via CSS (use WAAPI or JS check)
- Never animate layout. Only opacity, transform, pathLength.

### Chart aesthetics
- SVG, no canvas (except video export)
- Stroke: `1.5px` default, `2px` for hero line
- Color: one accent per chart (no rainbow)
- Grid: `rgba(255,255,255,0.04)` horizontal rules only
- Tooltip: `powo-tooltip` card, keyboard-accessible via cursor keys
- Empty/null days: gap in line (no interpolation — honesty principle)

---

## Data Pipeline Evolution

```
TODAY (manual):
  Apple Health export → iCloud Drive
  → node scripts/convert-export.mjs (validates, normalizes)
  → lib/imported-health-export.ts (committed)
  → git push main → Vercel deploys

H1 (one-command):
  npm run refresh
  → (same pipeline, gate-checked, ready to push in one step)

H2 (shortcut-assisted):
  Apple Shortcut: export → POST to /api/refresh-webhook
  → Vercel route writes to KV/Blob
  → next build triggered (Vercel deploy hook)

H3 (zero-touch):
  Shortcut runs on schedule (daily, 6am)
  → same webhook → auto-deploy
  → "synced X days ago" freshness stamp always current
```

---

## Non-Goals (protect the soul)

- ❌ Multi-user, accounts, auth, monetization, "platform."
- ❌ Every-metric-on-screen bloat. Curate ruthlessly.
- ❌ Breaking the editorial calm or the sub-1s load for novelty.
- ❌ Heavy client frameworks/state libs. Stay static-first + thin serverless.
- ❌ Faking data or hiding gaps.
- ❌ Generic health advice. The AI coach speaks to *Coley's* data only.

---

## Definition of "Best Ever" (the bar)

- 👁 **Every section is screenshot-worthy.** If Coley wouldn't share it, it's not done.
- ⚡ **Lighthouse ~100**, <1s on mobile, **content visible with JS off**, a11y WCAG AA+.
- 🫀 **Feels alive** — freshness measured in days, not months.
- 🎬 **Feels authored** — a clear identity, a real voice, one unforgettable moment.
- 🔁 **Refresh is one command** (eventually zero-touch).
- 🤖 **AI coach that sounds like a real coach** — specific, honest, earned.

---

## Engineering Guardrails (don't break the magic)

- **Gate every change**: `npm run qa` passes before `git push`. No exceptions.
- **Visual verify**: iPhone 390 / iPad 768 / desktop 1440, both themes, both `npm run dev` and `npm run preview`.
- **Protect the data pipeline**: `convert-export.mjs` → `imported-health-export.ts` → `normalize-health-export.ts` is the spine. Pipeline changes need the converter sanity check (183 days, 214 workouts, 57 sleep nights, vo2 latest 38.89) + all three test suites green.
- **Static-first**: new server work goes in thin `app/api/*` routes; the page stays SSG.
- **Hero is sacred**: H1.5 (hero wow) gets a preview branch + Boyd sign-off before it touches `main`.
- **Tests are required for data changes**: any normalizer change that alters a computed value must update the test expectation in the same commit.
- **No dead console.log or TODO stubs** shipped to `main`.

---

## Decisions Made

| Question | Decision |
|---|---|
| First horizon | **H1 — Alive & unbreakable** |
| Manual refresh | ✅ One-command (`npm run refresh`) — shipped |
| Never-blank guard | ✅ `@media (scripting:none)` — shipped |
| Apple Shortcut auto-sync | Build it (H3.6 / after H1 complete) |
| AI Coach | **Yes** — Vercel AI Gateway, streaming, Newsreader voice |
| Story Mode | Dedicated `/story` route (not folded into main) |
| Domain | Undecided — `powo.fit` is the leading candidate |
| Gait/walking-speed | Parse-tolerant, **not displayed** this pass |
| Unknown Activity workouts | Relabeled → **Pickleball** |
| Sleep display | **Duration + timing only** (stages on next re-export) |
