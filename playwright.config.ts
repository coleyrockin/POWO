import { defineConfig, devices } from '@playwright/test'

/**
 * Visual-regression harness — the iPhone-freeze guard (LOCAL dev tool).
 *
 * Captures full-page screenshots at three widths (390 / 820 / 1280) against a
 * production `next start` server, so layout work can be verified phase-by-phase:
 * the 390px baseline is the contract — any pixel delta means the phone moved.
 *
 * Workflow:
 *   npm run build                 # baselines run against the prod build
 *   npm run test:visual:update    # capture baselines (once, on a known-good state)
 *   ...make changes...
 *   npm run test:visual           # 390px must stay identical
 *
 * Baselines are OS/font-rendering specific, so they are gitignored, not
 * committed (see .gitignore). This is a working guard for the person making
 * the change, not a CI gate.
 *
 * Determinism: animations disabled per-screenshot, reduced-motion forced (the
 * app honors it — globals.css), grain + ambient tint neutralized via injected
 * CSS in the spec.
 */
const PORT = Number.parseInt(process.env.POWO_VISUAL_PORT ?? '3020', 10)
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  // Tight tolerance: the phone layout must be effectively pixel-identical.
  // A tiny ratio absorbs sub-pixel font AA without masking real regressions.
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  use: {
    baseURL: BASE_URL,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    timezoneId: 'UTC',
    locale: 'en-US',
  },
  projects: [
    {
      name: 'iphone-390',
      use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } },
    },
    {
      name: 'ipad-820',
      use: { ...devices['Desktop Chrome'], viewport: { width: 820, height: 1180 } },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: `npm run start -- -p ${PORT} -H 127.0.0.1`,
    url: BASE_URL,
    timeout: 60_000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
