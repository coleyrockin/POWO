import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const PORT = Number.parseInt(process.env.POWO_SCREENSHOT_PORT ?? '3021', 10)
const EXTERNAL_URL = process.env.POWO_SCREENSHOT_URL
const BASE_URL = EXTERNAL_URL ?? `http://127.0.0.1:${PORT}`
const OUTPUT_DIR = path.resolve('docs/screenshots')

const TARGETS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'ipad', width: 820, height: 1180 },
  { name: 'iphone', width: 390, height: 844 },
]

const SHOWCASE_CSS = `
  body::after { display: none !important; }
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
    transition-delay: 0s !important;
  }
  button[aria-label^="Switch to"] { display: none !important; }
`

async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url)
      if (response.ok) return
    } catch {
      // The production server is still starting.
    }
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  throw new Error(`Timed out waiting for ${url}`)
}

let server
let browser

try {
  if (!EXTERNAL_URL) {
    server = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'start', '--', '-p', String(PORT), '-H', '127.0.0.1'],
      { stdio: 'inherit' },
    )
  }

  await waitForServer(BASE_URL)
  await mkdir(OUTPUT_DIR, { recursive: true })
  browser = await chromium.launch()

  for (const target of TARGETS) {
    const context = await browser.newContext({
      viewport: { width: target.width, height: target.height },
      colorScheme: 'dark',
      reducedMotion: 'reduce',
      locale: 'en-US',
      timezoneId: 'UTC',
    })
    const page = await context.newPage()

    await page.addInitScript(css => {
      const style = document.createElement('style')
      style.textContent = css
      document.documentElement.appendChild(style)
    }, SHOWCASE_CSS)

    await page.goto(BASE_URL, { waitUntil: 'networkidle' })
    await page.addStyleTag({ content: SHOWCASE_CSS })
    await page.waitForTimeout(250)

    const layout = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      pageWidth: document.documentElement.scrollWidth,
      clippedSectionHeadings: [...document.querySelectorAll('section h2')]
        .filter(heading => heading.scrollWidth > heading.clientWidth + 1)
        .map(heading => heading.textContent?.trim() ?? ''),
    }))

    if (layout.pageWidth !== layout.viewportWidth) {
      throw new Error(
        `${target.name}: page width ${layout.pageWidth}px exceeds viewport ${layout.viewportWidth}px`,
      )
    }
    if (layout.clippedSectionHeadings.length > 0) {
      throw new Error(
        `${target.name}: clipped section headings: ${layout.clippedSectionHeadings.join(', ')}`,
      )
    }

    const outputPath = path.join(OUTPUT_DIR, `dashboard-${target.name}.png`)
    await page.screenshot({ path: outputPath, fullPage: false })
    console.log(`Captured ${path.relative(process.cwd(), outputPath)} (${target.width}x${target.height})`)

    await context.close()
  }
} finally {
  await browser?.close()
  server?.kill('SIGTERM')
}
