# POWO — Roadmap to the Best Personal Health Site Ever

> **What this is.** POWO (*Proof of Workout*) is Coley's living record of training — Apple Health turned into something cinematic, honest, and worth sharing. Not a portfolio piece, not a generic dashboard. A trophy case for a real body of work, that tells the story of the climb.

This document is the **vision and execution plan**. It replaces the old repo-hygiene roadmap.

---

## North Star

> **The most beautiful proof of work a human body can have** — a site that is *alive* (it updates), *a story* (not just numbers), and *crafted* to a level where every screen is worth screenshotting.

If POWO is open on a phone, the reaction should be: *"wait, my health data could look like THAT?"* — and then, scrolling, *"…and it actually tells me something."*

---

## Design principles

1. **Editorial, not dashboard.** A magazine about one athlete, rendered from data. Calm body, vibrant signature moments, a real narrative voice.
2. **Color is signal, not decoration.** Neutrals carry the page; accent = meaning (peak, good/bad, the hero metric). The hero KPI strip is the one allowed splash.
3. **Honest by default.** Show the gaps (the Dec–Jan ramp), the partial days, the naps. Truth is more impressive than a polished lie.
4. **Fast and unbreakable.** Static-first, <1s, content visible even if JS never runs. Motion is a garnish, never a dependency.
5. **Personal, single-subject.** This is Coley's. No accounts, no multi-tenant, no SaaS-ification. Depth over breadth.
6. **Every section earns its place.** If it's not screenshot-worthy or insight-worthy, cut it.

---

## The three pillars

| Pillar | Meaning | What it grows from (already built) |
|---|---|---|
| **ALIVE** | It updates itself; it shows "now," not a frozen snapshot. | `scripts/convert-export.mjs` → import module → `normalizeHealthExport` |
| **STORY** | A guided narrative of the journey, in a real voice. | Serif HEADLINE/Coach voice, `buildInsights`, the RHR 79→64 / VO₂ 33→40 arc |
| **CRAFT** | World-class polish, motion, identity, share. | Hybrid palette, masonry, share-card routes, chart-cursor primitives |

---

## Where we are (the foundation)

Shipped and live (`proof-of-workout-next.vercel.app`):
- **6-month dataset** (Dec 2 → Jun 2, 183 days) via a reusable export→TS converter.
- **Editorial system**: Bebas numerals · DM Mono labels · DM Sans body · **Newsreader serif** for narrative voice.
- **Hybrid palette**: calm neutral body, vibrant hero KPI sparkline strip.
- **Sections**: Hero, Explore (windowed + vs-prior), Period summary, Week-over-week, Insights (correlations), Streak/consistency heatmap, Daily table, VO₂, Cardiac, **Sleep (duration/timing)**, Workouts, Pushups, Rest & Training recommendations, Awards, Share cards.
- **Craft**: light/dark themes, interactive keyboard-scrubable charts, reduced-motion, 40px touch targets, OG/share-card image routes, capped editorial column, the Dec–Jan "winter baseline" story beat.
- **Gate**: `npm run qa` (lint · test · typecheck · build · audit · smoke) green; push `main` → Vercel auto-deploys.

This is already top-tier. Everything below is great → unforgettable.

---

## Horizon 1 — Make it alive & unbreakable *(next)*

The goal: it stops being a snapshot and starts being *Coley's app*.

- **H1.1 — One-touch data refresh.** Formalize the converter into a single command (`npm run refresh`) that ingests a new export, regenerates, runs the gate, and is ready to push. Add a visible **"synced N days ago"** freshness stamp. *Seed: `convert-export.mjs`.*
- **H1.2 — Unbreakable render (no-JS fallback).** Content must be visible even if framer-motion never runs (the entrance animations currently start at `opacity:0`). Ship a `@media (scripting: none)` / reduced-motion-safe baseline so the page is never blank. *This is the robustness backbone of "alive."*
- **H1.3 — Installable PWA.** Service worker + offline cache so POWO lives on Coley's home screen and opens instantly, anywhere. *Seed: `app/manifest.ts` already present.*
- **H1.4 — Milestone auto-cards.** Detect new records (VO₂ peak, RHR low, longest streak, distance milestone) and auto-generate a share card + a subtle in-page "🏆 new best" beat. *Seed: `app/api/cards/[variant]` + `summary.best_days`.*
- **H1.5 — The hero "2-second wow."** Elevate the first impression: a signature reveal moment (the climb drawing itself, the wordmark resolving). One unforgettable beat, restraint elsewhere.
- **H1.6 — Identity & domain.** A real POWO mark (favicon/app icon), a memorable domain (e.g. `powo.fit`), refined OG so a shared link looks like a magazine cover.

## Horizon 2 — Tell the story *(the soul)*

The data has a genuine arc. Make people *feel* it.

- **H2.1 — Story Mode (scrollytelling).** A guided narrative: winter baseline → the turn → the spring climb, with the charts animating to each beat (Pudding/NYT-style). The dashboard stays as the "instrument" view; Story Mode is the "film." *Seed: the existing narrative HEADLINE + Insights.*
- **H2.2 — AI Coach via Vercel AI Gateway.** Replace the rule-based coach takeaway with a real model that reads the data, writes the weekly narrative, and answers **"ask your data"** ("why did my HRV dip in March?"). Streamed, cached, zero-retention. *Seed: `buildInsights`, `analyzeRecovery`.*
- **H2.3 — Training Load (Fitness / Fatigue / Form).** The CTL/ATL/TSB model athletes actually trust — turn exercise minutes + HR into a load curve that explains readiness. A signature analytical centerpiece.
- **H2.4 — Annotations & events.** Mark real life on the timeline — an injury, a tournament, a trip — so the charts have context. Tiny CMS (a JSON the converter merges).

## Horizon 3 — Depth & delight *(ambitious)*

- **H3.1 — Workout route maps.** If GPS is in the export, render runs/walks/golf as glowing routes (the Strava moment). Stunning, shareable.
- **H3.2 — HR-zone breakdowns** per workout + time-in-zone trends.
- **H3.3 — Mobility section.** Surface the signals already in the export (walking speed, steadiness, gait asymmetry/double-support) as a "how you move" panel.
- **H3.4 — Sleep stages.** When Coley re-exports with Core/Deep/REM segments, the converter extends and the Sleep section gains stage charts on top of the duration view.
- **H3.5 — Season / Year in Review.** A generated, animated recap artifact ("Coley's Spring '26") — the thing that gets shared.
- **H3.6 — Live Apple Health sync.** The endgame of "alive": an Apple Shortcut auto-exports and POSTs to a Vercel route that regenerates on a schedule. Zero-touch freshness.
- **H3.7 — Animated/video share export.** Share cards that move.

---

## Signature moments (the things people remember)

1. **The hero wow** — the 2-second reveal (H1.5).
2. **The climb** — Story Mode walking the RHR 79→64 / VO₂ 33→40 arc (H2.1).
3. **"Ask your data"** — the AI coach answering real questions (H2.2).
4. **Route maps** glowing on the page (H3.1).
5. **"New best"** milestone cards that auto-appear and beg to be shared (H1.4).

---

## Non-goals (protect the soul)

- ❌ Multi-user, accounts, auth, monetization, "platform."
- ❌ Every-metric-on-screen bloat. Curate ruthlessly.
- ❌ Breaking the editorial calm or the sub-1s load for novelty.
- ❌ Heavy client frameworks/state libs. Stay static-first + thin serverless.
- ❌ Faking data or hiding gaps.

---

## Definition of "best ever" (the bar)

- 👁 **Every section is screenshot-worthy.** If Coley wouldn't share it, it's not done.
- ⚡ **Lighthouse ~100**, <1s on mobile, **content visible with JS off**, a11y AA+.
- 🫀 **Feels alive** — freshness measured in days, not months.
- 🎬 **Feels authored** — a clear identity, a real voice, one unforgettable moment.
- 🔁 **Refresh is one command** (eventually zero-touch).

---

## Engineering guardrails (don't break the magic)

- **Gate every change**: `npm run qa` + visual check at iPhone 390 / iPad 768 / desktop 1440, both themes.
- **Protect the data pipeline**: `convert-export.mjs` → `imported-health-export.ts` → `normalize-health-export.ts` is the spine; changes need the converter sanity check (period days, counts, sleep nights) + tests.
- **Static-first**: new server work goes in thin `app/api/*` routes / Fluid functions; the page stays SSG.
- **Push `main` → deploys.** Keep it green before pushing.

---

## Forks for Boyd (these steer the build)

1. **Domain** — claim a name? (`powo.fit` / `proofofworkout.app` / keep Vercel URL)
2. **"Alive" path** — start with one-command manual refresh (H1.1), or go straight for the Apple Shortcut auto-sync (H3.6)?
3. **AI Coach** — wire a real model (Vercel AI Gateway) for the voice + "ask your data"? (yes = a signature feature)
4. **Story Mode** — a dedicated `/story` scroll experience, or fold the narrative into the main page?

> Recommended first strike: **H1.2 (unbreakable render)** + **H1.1 (one-touch refresh)** + **H1.5 (hero wow)** — lock in "alive & never blank," then chase Story Mode + AI Coach as the soul.
