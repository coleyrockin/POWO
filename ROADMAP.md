# POWO Repository Roadmap

## 1) Project Summary

POWO is a **frontend-only dashboard** that visualizes curated health and performance data from static data files. It is implemented as a Next.js (App Router) TypeScript application with componentized sections (header, daily/weekly summaries, charts, recommendations, and footer actions). The product currently emphasizes clarity, performance, and deterministic rendering from local health payloads rather than live data feeds.

## 2) Current Product Vision

Current vision appears to be a polished personal/consumer analytics dashboard for wellbeing metrics (steps, cardio, sleep, recovery, workout quality, recovery suggestions).

What appears to be intended: a stable, portfolio-ready dashboard experience with:

- predictable static output
- low deployment friction
- clear health narrative (daily + weekly + trend summary)
- simple next-step recommendations

## 3) Target Users

- Product/UX reviewers validating architecture and implementation quality.
- Contributors who want a stable starter to continue hardening a dashboard app.
- Recruiters and maintainers needing a clear, well-documented signal of project quality.

## 4) Current Strengths

- Clean App Router layout and clear route-level organization.
- Strong documentation baseline already present (`README`, docs folder).
- Existing CI workflow and smoke-test script for deployment-like checks.
- Sensible deployment hardening already present (manifest/robots/sitemap/OG/Twitter routes).
- TypeScript usage throughout core app and utility modules.

## 5) Current Weaknesses

- No single-source “future execution plan” for new agents.
- Documentation contains minor drift (status text and screenshot references can become stale).
- Accessibility and UX refinements are partially applied but inconsistent.
- No explicit documentation of “what is done” vs “what is planned” in roadmap form.
- Repo lacks a single “known risks + verification history” artifact for the next contributor.

## 6) What appears finished

- Baseline UI layout and multiple dashboard sections are implemented.
- Static dataset + normalization pipeline and helper utilities are present.
- Scripts and CI commands are configured for lint/build/typecheck/test flows.
- Production-oriented metadata routes and SEO-adjacent primitives are in place.
- Base deployment smoke targets exist in script form.

## 7) What appears unfinished

- A definitive execution roadmap is missing.
- README and docs need explicit status clarity and clear “planned vs implemented” demarcation.
- Validation outcomes are not centrally tracked as part of onboarding docs.
- Some documentation links/asset references are likely to drift as screenshots and routes evolve.
- A single contributor playbook for first 1-2 days is not yet documented.

## 8) What appears broken or risky

- No showstopper app logic failures are evident from static inspection.
- Main risk is **maintenance drift**: outdated doc claims and hidden assumptions about scripts/paths can mislead next agent.
- UX/accessibility polish is incomplete in consistency, especially around semantic structure and assistive clarity across all components.
- There is still room to harden checks for future regressions (especially accessibility and runtime smoke breadth).

## 9) What appears duplicated or outdated

- Roadmap-like language exists in multiple locations and can conflict if not canonicalized.
- A single source of truth for feature status and acceptance criteria is absent.
- Some guidance appears to have shifted from “demo status” to “planned improvements” without a central status table.

## 10) What hurts maintainability

- Without a strict “no new features in planning stage” execution gate, future agents may conflate planning, refactoring, and feature work.
- Missing explicit ownership/ordering can cause duplicated effort.
- No unified “first run” command checklist with expected outputs.

## 11) What hurts user experience

- Visual design is generally strong for a dashboard but UX consistency could improve via clearer hierarchy and fewer mixed patterns.
- Component intent is mostly clear, but not all pathways have documented behavior expectations (especially empty/error states).
- Any stale copy can degrade trust if users encounter outdated claims.

## 12) What hurts recruiter/GitHub presentation

- A high-quality app with strong data/visual content is present, but repository narrative is not yet “auditable” in one place.
- Recruiters/readers may struggle to understand current status and next work due to dispersed notes.
- Lack of a roadmap reduces perceived execution maturity.

## 13) What should be protected and not broken

- Data normalization and derivation logic.
- Existing component contracts and structure in the current dashboard screens.
- Existing CI workflow and smoke test intent.
- Deployment metadata routes and existing production checks.
- Current TypeScript boundaries and static data assumptions unless specifically scoped.

## 14) What the next agent should work on first

1. Review this roadmap and README status alignment.
2. Confirm local/dev commands and reproduce verification baseline.
3. Fix highest-risk maintainability gaps before adding behavior changes.
4. Stabilize documentation-to-implementation mapping.
5. Validate accessibility and test coverage in the existing guardrails before functional expansion.

## 15) Detailed Execution Roadmap

Use this section as a task-by-task backlog. Each recommendation includes what to do, why, impact, and how to measure success.

### 15.1 Repository Truth Baseline (Priority: P0)
- What needs to be done:
  - Define and freeze a canonical status section in README and ROADMAP with explicit implemented vs planned work.
  - Add a “Current Verification Status” block including latest known command results.
- Why it matters:
  - Prevents decision drift and duplicate contradictory planning.
- Expected impact:
  - Faster onboarding, fewer duplicate efforts, safer handoff.
- Difficulty: Low
- Risk: Low
- Dependencies: `README.md`, `ROADMAP.md`
- Files/folders:
  - `README.md`
  - `ROADMAP.md`
- Suggested order:
  - 1) Create this section in ROADMAP.
  - 2) Link it from README.
  - 3) Capture baseline verification output from one safe command.
- Acceptance criteria:
  - New contributors can answer “what is shipped” and “what is planned” in under 2 minutes.
- Tests/checks:
  - `npm run lint` (baseline)
  - `npm run qa` (if script remains green in environment)

### 15.2 Verification Status Standardization (Priority: P0)
- What needs to be done:
  - Keep a short section documenting command + result + error summary + pre-existing/introduced guidance.
- Why it matters:
  - Avoids hidden build/test failures and improves confidence when work is handed off.
- Expected impact:
  - Better root-cause attribution for future regressions.
- Difficulty: Low
- Risk: Low
- Dependencies: `ROADMAP.md`, `.github/workflows/ci.yml`
- Files/folders:
  - `ROADMAP.md`
  - `.github/workflows/ci.yml`
  - `docs/audits/*.md` (optional historical continuity)
- Suggested order:
  - 1) Document current baseline state.
  - 2) Add date-stamped entries on future runs.
- Acceptance criteria:
  - The latest verification result is clearly dated and states whether failure is pre-existing.
- Tests/checks:
  - `npm run lint`
  - `npm run typecheck` (if not too heavy)

### 15.3 README Refresh for Clarity (Priority: P1)
- What needs to be done:
  - Update README sections: what exists today, how to run, how to test, project status, roadmap link, deployment/demo links.
  - Remove misleading language and call out planned features explicitly as planned.
- Why it matters:
  - Improves external-facing accuracy and onboarding.
- Expected impact:
  - Higher-quality portfolio and easier evaluator review.
- Difficulty: Low
- Risk: Low
- Dependencies: `README.md`
- Files/folders:
  - `README.md`
- Suggested order:
  - 1) Verify all links.
  - 2) Rewrite status language.
  - 3) Add roadmap pointer.
- Acceptance criteria:
  - Reader can run project locally from README alone.
  - No false claims about completed features.
- Tests/checks:
  - Manual link check for local/deploy/demo references.

### 15.4 Architecture Documentation Alignment (Priority: P1)
- What needs to be done:
  - Add a compact architecture map (routes, data flow, component layers).
  - Clarify assumptions: static input dataset, no runtime API dependency.
- Why it matters:
  - Protects the current predictable behavior and avoids accidental architecture drift.
- Expected impact:
  - More accurate refactor decisions and lower accidental regression risk.
- Difficulty: Medium
- Risk: Low
- Dependencies: `app`, `lib`, `scripts`
- Files/folders:
  - `ROADMAP.md`
  - `app/`
  - `lib/`
  - `scripts/`
- Suggested order:
  - 1) Document current data and component flow.
  - 2) Record explicit “do not change without test gate” boundaries.
- Acceptance criteria:
  - New agent can describe full render pipeline without opening every file.
- Tests/checks:
  - `npm run build` (if time-safe)

### 15.5 Security Posture Review (Priority: P1)
- What needs to be done:
  - Document current security controls (headers, content policy, build-time static flow) and residual risks.
  - Keep an explicit list of checks to keep current behavior safe.
- Why it matters:
  - Avoid silent weakening of production security posture.
- Expected impact:
  - Easier maintenance of secure defaults.
- Difficulty: Low
- Risk: Low
- Dependencies: `next.config.ts`, `app/
` , `package.json`
- Files/folders:
  - `ROADMAP.md`
  - `next.config.ts`
- Suggested order:
  - 1) inventory current controls;
  - 2) list follow-up checks.
- Acceptance criteria:
  - Security-sensitive items are enumerated with “must keep” vs “safe to revisit”.
- Tests/checks:
  - `npm run lint`
  - review header config manually

### 15.6 Accessibility Action Plan (Priority: P1)
- What needs to be done:
  - Standardize heading semantics, focus management, and label clarity in component-level notes.
  - Identify missing/weak landmarks for planned clean-up by next engineering pass.
- Why it matters:
  - Dashboard usefulness depends on usable semantics and keyboard navigation.
- Expected impact:
  - Better accessibility compliance and fewer a11y regressions.
- Difficulty: Medium
- Risk: Low
- Dependencies: `app/`, `components/`
- Files/folders:
  - `ROADMAP.md`
  - `app/`
  - `components/`
- Suggested order:
  - 1) Add audit list to roadmap.
  - 2) Prioritize critical paths (navigation, table summaries, key action strips).
- Acceptance criteria:
  - A testable list of component-specific a11y tasks exists with owners and order.
- Tests/checks:
  - Run existing test suite or add a follow-up command for accessibility checks in next iteration.

### 15.7 Performance and Stability Checkpoints (Priority: P1)
- What needs to be done:
  - Document image/font/script impact, component rendering density, and bundle-size watchpoints.
  - Define threshold-based performance checks for future PRs.
- Why it matters:
  - Dashboard UI can regress quickly with larger data payloads.
- Expected impact:
  - Predictable runtime and easier optimization planning.
- Difficulty: Medium
- Risk: Low
- Dependencies: `package.json`, build outputs, scripts
- Files/folders:
  - `ROADMAP.md`
  - `next.config.ts`
  - `package.json`
- Suggested order:
  - 1) Add measurable checks;
  - 2) document review cadence.
- Acceptance criteria:
  - A simple “performance regression guard” section exists with repeatable checks.
- Tests/checks:
  - `npm run build`
  - `npm run smoke`

### 15.8 SEO & Metadata Readiness (Priority: P2)
- What needs to be done:
  - Capture current metadata behavior and identify any remaining content/metadata mismatches.
  - Keep only accurate metadata claims in docs.
- Why it matters:
  - Improves discoverability and prevents stale crawl-facing details.
- Expected impact:
  - Cleaner search/preview behavior.
- Difficulty: Low
- Risk: Low
- Dependencies: `app/layout.tsx`, `app/manifest.ts`, `app/robots.ts`, `app/sitemap.ts`
- Files/folders:
  - `ROADMAP.md`
  - `app/`
- Suggested order:
  - 1) Document current state; 2) add planned improvements.
- Acceptance criteria:
  - Metadata and links in docs are consistent with current implementation.
- Tests/checks:
  - `npm run build`

### 15.9 Testing Strategy (Priority: P1)
- What needs to be done:
  - Define a mandatory runbook for each change:
    - lint
    - typecheck
    - tests
    - build
    - smoke
  - Include expected outputs and fail-fast interpretation.
- Why it matters:
  - Reduces accidental breakage and makes future maintenance reliable.
- Expected impact:
  - Less uncertainty for future contributors.
- Difficulty: Low
- Risk: Low
- Dependencies: CI script and existing test stack
- Files/folders:
  - `ROADMAP.md`
  - `.github/workflows/ci.yml`
  - `scripts/`
- Suggested order:
  - 1) codify pre/post command sequence;
  - 2) define pass/fail expectations.
- Acceptance criteria:
  - New tasks always include mandatory checks and expected outcomes.
- Tests/checks:
  - `npm run verify`, `npm run qa`, `npm run smoke`

### 15.10 CI/CD and Deployment Documentation (Priority: P1)
- What needs to be done:
  - Update documentation around existing CI and deployment path.
  - Clarify required env assumptions and manual review steps for release-like runs.
- Why it matters:
  - Keeps release process transparent and repeatable.
- Expected impact:
  - Better production confidence for contributors.
- Difficulty: Low
- Risk: Low
- Dependencies: `.github/workflows/ci.yml`, deployment docs/references
- Files/folders:
  - `ROADMAP.md`
  - `.github/workflows/ci.yml`
  - `docs/RELEASE_CHECKLIST.md`
- Suggested order:
  - 1) Inventory current pipeline;
  - 2) add checklist for release checks.
- Acceptance criteria:
  - Next agent can run through deploy readiness in documented order.
- Tests/checks:
  - `npm run lint`, `npm run build`

### 15.11 GitHub / Recruiter Presentation Polish (Priority: P1)
- What needs to be done:
  - Align README and roadmap language to avoid hype and clarify “done vs planned”.
  - Add clear, honest status badges and quick links.
- Why it matters:
  - Portfolio signal quality depends on honesty and clarity.
- Expected impact:
  - Better reviewability and perceived maturity.
- Difficulty: Low
- Risk: Low
- Dependencies: `README.md`
- Files/folders:
  - `README.md`
  - `ROADMAP.md`
- Suggested order:
  - 1) prune vague adjectives;
  - 2) replace with concrete claims;
  - 3) add a status matrix.
- Acceptance criteria:
  - README reflects actual implemented features only.
- Tests/checks:
  - No app-level command required; doc link validation only.

### 15.12 Future Feature Ideas (Priority: P2)
- What needs to be done:
  - Keep future ideas explicitly marked as planned and separated from shipped functionality.
  - Prioritize ideas that improve confidence over novelty.
- Why it matters:
  - Prevents accidental premature scope creep.
- Expected impact:
  - More realistic planning and safer execution order.
- Difficulty: Medium
- Risk: Medium
- Dependencies: project requirements and maintainer priorities
- Files/folders:
  - `ROADMAP.md`
- Suggested order:
  - 1) document impact-based future ideas;
  - 2) rank by value/risk.
- Acceptance criteria:
  - No new feature appears as implemented in current status sections.
- Tests/checks:
  - Documented only; next agent decides test impact.

## 16) Suggested Milestone Order

1. **Milestone A – Onboarding baseline**: canonical status, README link correctness, verification snapshot.
2. **Milestone B – Quality hygiene**: architecture/security/accessibility/performance documentation.
3. **Milestone C – GitHub presentation**: concise portfolio-ready framing and roadmap-to-readme alignment.
4. **Milestone D – Delivery readiness**: update testing/deployment docs with explicit acceptance paths.
5. **Milestone E – Feature planning**: backlog grooming for next phase with constraints preserved.

## 17) Current Verification Status

| Date | Command | Result | Error Summary | Pre-existing? | Recommendation |
| --- | --- | --- | --- | --- | --- |
| 2026-05-26 | `npm run lint` | Passed | No lint errors. | Unknown; no code changes in this planning pass. | Keep as baseline command for every doc iteration. |
| 2026-05-26 | `npm run test` | Passed | Test script completed successfully. | Unknown; no app logic changes in this pass. | Keep as required baseline command. |
| 2026-05-26 | `npm run smoke` | Failed to run | `next start` could not bind to `127.0.0.1:3010` (`EPERM: operation not permitted`). | Likely environment/sandbox-specific (port bind restriction) rather than repo regression from this pass. | Retry outside restricted environment or use permitted host/port. Do not infer app regression from this alone. |

> Note: During this pass, lint and test pass unchanged. The smoke failure appears to be an execution-environment restriction and did not involve documentation changes.

## 18) High-Priority Fixes (Execution-ready)

- **Clarify project status language in README** (low risk, high onboarding value).
- **Add canonical roadmap status table** in `ROADMAP.md` (low risk, high team throughput).
- **Record verification results and drift notes** (low risk, high troubleshooting value).
- **Document first-run and pre/post command sequence** (low risk, high predictability).
- **Create clear “do not break” list for next agent** (low risk, high stability value).

## 19) Architecture Recommendations

- Keep static pipeline as-is for current version.
- Do not introduce runtime dependencies without explicit milestone and testing scope.
- Document component boundaries as “visual, data, and utility layers” for future refactors.
- Keep data normalization behavior stable; changes must include test/verification expansion.

## 20) Refactor Recommendations

- Refactor planning, not implementation, in this phase:
  - Normalize naming and status wording across docs.
  - Consolidate roadmap references into a single canonical source.
  - Keep future refactor proposals in a dedicated section with risk/benefit and dependencies.

## 21) UI and UX Recommendations

- Preserve current UI structure.
- Improve copy and semantics where user intent is unclear.
- Document a prioritized list of accessibility and empty-state refinements (no behavioral change yet).

## 22) Performance Recommendations

- Add a lightweight performance check section to ROADMAP:
  - Build size and route generation consistency checks.
  - Keep static assets within stable baseline.
  - Validate smoke script passes after doc edits.

## 23) Security Recommendations

- Preserve and explicitly protect existing security headers and safe defaults.
- Treat any header/CSP changes as production-impacting and require explicit acceptance.
- Continue current dependency hygiene and security audit in CI.

## 24) Accessibility Recommendations

- Include in next milestone:
  - Section landmarks and heading order standardization.
  - Keyboard order review for interactive strips.
  - Form/input label consistency (where applicable).

## 25) SEO Recommendations

- Keep metadata/route generation aligned with actual docs and deployment URLs.
- Confirm open graph image, twitter image, and manifest/sitemap/robots entries remain valid as routes evolve.

## 26) Testing Strategy

A recommended execution sequence:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build`
5. `npm run smoke`

If a command fails:

- Capture full command output in `Current Verification Status`.
- Do not change behavior unless failure is caused by documentation-only context (unlikely for these commands).
- Escalate as an issue for next agent with explicit acceptance criteria.

## 27) CI/CD and Deployment Recommendations

- Keep existing CI structure, but make its purpose clear in ROADMAP and README.
- For each release-like change, require:
  - successful `verify` or `qa` equivalent flow,
  - smoke validation,
  - deployment checklist completion.

## 28) Documentation Improvements

- Centralize status.
- Remove contradictory or outdated roadmap language.
- Use consistent section naming and plain-language outcomes.
- Add “Planned vs shipped” labels everywhere status could be ambiguous.
- Keep CHANGELOG-like details in a lightweight doc history section if needed.

## 29) Recruiter and Portfolio Polish

- Ensure README reads as an engineer-grade project summary, not a marketing page.
- Show realistic scope and proof points (build, tests, smoke, deployment path).
- Avoid overstating future capabilities.

## 30) Production Readiness Checklist

Before any future feature work, check:

- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run build` passes.
- `npm run smoke` passes.
- `ROADMAP.md` status and verification block updated.
- No stale deployment/demo links in README.

## 31) Next Agent Instructions

### First 5 tasks

1. Read `ROADMAP.md` and `README.md` for current state and constraints.
2. Run baseline verification command(s):
   - `npm run lint`
3. Confirm deployment/smoke commands and scripts are current (`package.json`, `scripts/`).
4. Fill in `Current Verification Status` with current run output and pre-existing-issue judgment.
5. Update docs only and commit one small, auditable doc delta.

### Files likely involved

- `ROADMAP.md` (primary)
- `README.md`
- `.github/workflows/ci.yml` (for reference only)
- `scripts/smoke-production.mjs`

### Commands before making changes

1. `git status --short`
2. `npm run lint`
3. `npm run verify` (or `npm run qa`, depending on environment)

### Commands after making changes

1. `git status --short`
2. `npm run lint`
3. `git diff --stat`
4. `git add README.md ROADMAP.md`

### Tests to verify

- `npm run lint`
- `npm run build`
- `npm run smoke`

### What not to break

- Existing dashboard structure and behavior.
- Data normalization logic and existing component boundaries.
- CI command assumptions and smoke test intent.
- Existing security header assumptions and deployment routes.

### When to stop and ask for human review

- If a verification command fails in ways unrelated to docs and output suggests production-impacting behavior changes.
- If data schema changes are requested in scope (this roadmap assumes planning-only in this phase).
- Before deleting or renaming major app files.
- Before changing runtime dependencies.

### Recommended first commit message

`docs: document current system and next-agent execution plan`

### README update checklist (if needed)

- Verify all feature claims are shipped-only.
- Add/refresh roadmap link: `ROADMAP.md`.
- Keep “what is done” and “what is planned” clearly separated.
- Confirm demo/deployment links point to the active target.

## 32) How to Use This Roadmap

- Treat each roadmap section as an action card.
- For each card, execute in order: Understand -> Verify -> Update docs -> Re-run minimal safe checks -> Commit.
- Never merge feature changes in this planning phase unless explicitly requested by a future maintainer.
