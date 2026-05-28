import { test, expect } from '@playwright/test'

/**
 * Full-page visual baseline of the dashboard at the active project's viewport.
 *
 * Snapshot name is keyed only by the project (viewport), so the same spec
 * produces one baseline per width: iphone-390 / ipad-820 / desktop-1280.
 *
 * Before capture we neutralize non-deterministic decoration that would
 * otherwise cause flaky sub-pixel diffs:
 *   - grain overlay (body::after) — animated-feel noise texture
 *   - ambient tint transition (body::before) — pinned to initial, no transition
 *   - any residual CSS transitions/animations — zeroed
 * Reduced motion is already forced via playwright.config (use.reducedMotion).
 */
const NEUTRALIZE_CSS = `
  body::after { display: none !important; }
  body::before { transition: none !important; }
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
`

test('dashboard full page', async ({ page }) => {
  await page.addInitScript((css) => {
    const style = document.createElement('style')
    style.textContent = css
    document.documentElement.appendChild(style)
  }, NEUTRALIZE_CSS)

  await page.goto('/', { waitUntil: 'networkidle' })

  // Let scroll-triggered reveals settle into their final (motion-reduced) state.
  await page.waitForTimeout(500)

  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
  })
})
