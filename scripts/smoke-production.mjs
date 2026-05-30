import { spawn } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { once } from 'node:events'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url))
const PORT = Number.parseInt(process.env.POWO_SMOKE_PORT ?? '3010', 10)
const HOST = '127.0.0.1'
const BASE_URL = `http://${HOST}:${PORT}`
const BUILD_ID_PATH = join(ROOT_DIR, '.next', 'BUILD_ID')
const NPM_COMMAND = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const START_TIMEOUT_MS = 45_000

let server
let serverExit = null
const serverOutput = []

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertIncludes(value, expected, label) {
  assert(
    value.includes(expected),
    `${label} did not include ${JSON.stringify(expected)}. Received: ${JSON.stringify(value.slice(0, 240))}`,
  )
}

function assertHeader(response, name, expected, label = name) {
  const value = response.headers.get(name) ?? ''
  assertIncludes(value, expected, label)
}

function validatePort() {
  assert(Number.isInteger(PORT) && PORT > 0 && PORT < 65_536, 'POWO_SMOKE_PORT must be a valid TCP port')
}

function validateBuildExists() {
  assert(
    existsSync(BUILD_ID_PATH),
    'Missing .next build output. Run `npm run build` before `npm run smoke`.',
  )
}

function expectedExportDate() {
  const source = readFileSync(join(ROOT_DIR, 'lib', 'imported-health-export.ts'), 'utf8')
  const match = source.match(/export_date:\s*['"]([^'"]+)['"]/)

  assert(match, 'Could not read expected export_date from lib/imported-health-export.ts')
  return match[1]
}

function startServer() {
  const child = spawn(NPM_COMMAND, ['run', 'start', '--', '-p', String(PORT), '-H', HOST], {
    cwd: ROOT_DIR,
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: String(PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  child.stdout.on('data', (chunk) => serverOutput.push(chunk.toString()))
  child.stderr.on('data', (chunk) => serverOutput.push(chunk.toString()))
  child.on('exit', (code, signal) => {
    serverExit = { code, signal }
  })

  return child
}

async function stopServer() {
  if (!server || serverExit) {
    return
  }

  sendServerSignal('SIGTERM')

  const exited = await Promise.race([
    once(server, 'exit').then(() => true),
    delay(5_000).then(() => false),
  ])

  if (!exited) {
    sendServerSignal('SIGKILL')
  }
}

function sendServerSignal(signal) {
  if (!server || !server.pid) {
    return
  }

  try {
    if (process.platform === 'win32') {
      server.kill(signal)
    } else {
      process.kill(-server.pid, signal)
    }
  } catch (error) {
    if (error?.code !== 'ESRCH') {
      throw error
    }
  }
}

async function fetchWithTimeout(pathname, options = {}) {
  const response = await fetch(`${BASE_URL}${pathname}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(options.timeoutMs ?? 5_000),
  })

  return response
}

async function fetchText(pathname, expectedStatus) {
  const response = await fetchWithTimeout(pathname)
  const text = await response.text()

  assert(
    response.status === expectedStatus,
    `${pathname} returned ${response.status}; expected ${expectedStatus}. Body: ${text.slice(0, 240)}`,
  )

  return { response, text }
}

async function waitForReady() {
  const startedAt = Date.now()
  let lastError

  while (Date.now() - startedAt < START_TIMEOUT_MS) {
    if (serverExit) {
      throw new Error(`next start exited before readiness: ${formatServerExit()}`)
    }

    try {
      const { text } = await fetchText('/', 200)

      assertIncludes(text, 'POWO', 'homepage identity')
      assertIncludes(text, 'Apple Health', 'homepage identity')
      return
    } catch (error) {
      lastError = error
      await delay(500)
    }
  }

  throw new Error(`Timed out waiting for ${BASE_URL}. Last error: ${lastError?.message ?? 'unknown error'}`)
}

async function checkHomePage() {
  const { response, text } = await fetchText('/', 200)

  assertHeader(response, 'content-type', 'text/html', 'homepage content-type')
  assertHeader(response, 'content-security-policy', "default-src 'self'", 'homepage CSP')
  assertHeader(response, 'content-security-policy', "frame-ancestors 'none'", 'homepage CSP')
  assertHeader(response, 'content-security-policy', 'https://va.vercel-scripts.com', 'homepage CSP')
  assertHeader(response, 'content-security-policy', 'https://vitals.vercel-insights.com', 'homepage CSP')
  assertHeader(response, 'x-content-type-options', 'nosniff')
  assertHeader(response, 'x-frame-options', 'DENY')
  assertHeader(response, 'referrer-policy', 'strict-origin-when-cross-origin')
  assertHeader(response, 'permissions-policy', 'camera=()')
  assertIncludes(text, 'POWO', 'homepage')
  assertIncludes(text, 'Apple Health', 'homepage')
  assertIncludes(text, 'VO₂', 'homepage')
}

async function checkManifest() {
  const { response, text } = await fetchText('/manifest.webmanifest', 200)

  assert(
    (response.headers.get('content-type') ?? '').includes('manifest') ||
      (response.headers.get('content-type') ?? '').includes('json'),
    `/manifest.webmanifest returned unexpected content-type: ${response.headers.get('content-type')}`,
  )

  const manifest = JSON.parse(text)
  assert(manifest.name === 'POWO — Proof of Workout', 'manifest name is incorrect')
  assert(manifest.short_name === 'POWO', 'manifest short_name is incorrect')
  assert(manifest.start_url === '/', 'manifest start_url is incorrect')
  assert(manifest.display === 'standalone', 'manifest display is incorrect')
  assert(manifest.description?.includes('91 days of Apple Health'), 'manifest description is missing POWO identity')
}

async function checkRobots() {
  const { response, text } = await fetchText('/robots.txt', 200)

  assertHeader(response, 'content-type', 'text/plain', 'robots content-type')
  assertIncludes(text, 'User-Agent: *', 'robots.txt')
  assertIncludes(text, 'Allow: /', 'robots.txt')
  assertIncludes(text, 'Sitemap: https://proof-of-workout-next.vercel.app/sitemap.xml', 'robots.txt')
}

async function checkSitemap() {
  const exportDate = expectedExportDate()
  const { response, text } = await fetchText('/sitemap.xml', 200)

  assert(
    (response.headers.get('content-type') ?? '').includes('xml'),
    `/sitemap.xml returned unexpected content-type: ${response.headers.get('content-type')}`,
  )
  assertIncludes(text, '<loc>https://proof-of-workout-next.vercel.app</loc>', 'sitemap.xml')
  assertIncludes(text, exportDate, 'sitemap.xml')
}

async function checkPng(pathname) {
  const response = await fetchWithTimeout(pathname, { timeoutMs: 10_000 })
  const bytes = new Uint8Array(await response.arrayBuffer())

  assert(response.status === 200, `${pathname} returned ${response.status}; expected 200`)
  assertHeader(response, 'content-type', 'image/png', `${pathname} content-type`)
  assert(bytes.length > 1_000, `${pathname} returned an unexpectedly small PNG response`)
}

async function checkNotFound() {
  const { response, text } = await fetchText('/missing-powo-smoke-route', 404)

  assertHeader(response, 'content-type', 'text/html', '404 content-type')
  assertIncludes(text, 'This page took a rest day', '404 page')
  assertIncludes(text, 'Back to POWO', '404 page')
}

function formatServerExit() {
  if (!serverExit) {
    return 'still running'
  }

  return `code=${serverExit.code ?? 'null'} signal=${serverExit.signal ?? 'null'}`
}

function printServerOutput() {
  const output = serverOutput.join('').trim()

  if (output) {
    console.error(`\nnext start output:\n${output.slice(-4_000)}`)
  }
}

async function run() {
  validatePort()
  validateBuildExists()

  server = startServer()
  await waitForReady()

  const checks = [
    ['/', checkHomePage],
    ['/manifest.webmanifest', checkManifest],
    ['/robots.txt', checkRobots],
    ['/sitemap.xml', checkSitemap],
    ['/opengraph-image', () => checkPng('/opengraph-image')],
    ['/twitter-image', () => checkPng('/twitter-image')],
    ['/api/cards/overview', () => checkPng('/api/cards/overview')],
    ['/api/cards/week', () => checkPng('/api/cards/week')],
    ['/api/cards/activity', () => checkPng('/api/cards/activity')],
    ['/api/cards/story', () => checkPng('/api/cards/story')],
    ['/missing-powo-smoke-route', checkNotFound],
  ]

  for (const [label, check] of checks) {
    await check()
    console.log(`✓ ${label}`)
  }

  assert(!serverExit, `next start exited unexpectedly after checks: ${formatServerExit()}`)
  console.log(`Production smoke passed on ${BASE_URL}`)
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    try {
      sendServerSignal('SIGTERM')
    } finally {
      process.exit(signal === 'SIGINT' ? 130 : 143)
    }
  })
}

try {
  await run()
} catch (error) {
  console.error(`\nProduction smoke failed: ${error.message}`)
  printServerOutput()
  process.exitCode = 1
} finally {
  await stopServer()
}
