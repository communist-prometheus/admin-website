import process from 'node:process'
import type { Page } from '@prometheus/e2e-toolkit'

const NOISE_HOSTS = ['api.github.com/user'] as const

const isNoise = (text: string): boolean =>
  NOISE_HOSTS.some(h => text.includes(h)) ||
  (text.includes('401') && text.includes('Failed to load resource'))

const wireConsole = (page: Page, tag: string): void => {
  page.on('console', m => {
    const t = m.type()
    if (t !== 'error' && t !== 'warning') return
    const text = m.text()
    if (isNoise(text)) return
    process.stdout.write(`[${tag}][${t}] ${text.slice(0, 400)}\n`)
  })
  page.on('pageerror', e => {
    process.stdout.write(`[${tag}][pageerror] ${e.message}\n`)
  })
}

const wireNetworkFailures = (page: Page, tag: string): void => {
  page.on('requestfailed', r => {
    const url = r.url()
    if (NOISE_HOSTS.some(h => url.includes(h))) return
    const reason = r.failure()?.errorText ?? 'unknown'
    if (reason === 'net::ERR_ABORTED') return
    process.stdout.write(
      `[${tag}][reqfail] ${r.method()} ${url} — ${reason}\n`
    )
  })
}

const wireMutations = (page: Page, tag: string): void => {
  /* Stream every SW-routed mutation so a hung commit chain shows up
   * in stdout instead of as a silent 60s push-never-landed timeout.
   * GETs are noise (list/get/role) — only writes matter. */
  page.on('response', r => {
    const url = r.url()
    if (!url.includes('/api/github/')) return
    const method = r.request().method()
    if (method === 'GET') return
    const path = url.replace(/^https?:\/\/[^/]+/, '')
    process.stdout.write(`[${tag}][sw] ${method} ${path} → ${r.status()}\n`)
  })
}

/**
 * Stream browser console + page errors + SW-routed mutations to
 * stdout so a hung test tells us *why* it is hung — SW init reason,
 * network failures, Vue runtime errors, missing commit. Without this
 * the test produces only a `waitForCondition timed out` line and
 * forces a trace dive.
 *
 * Filters out connectivity heartbeat noise (HEAD api.github.com/user
 * is intentionally unauthenticated and always returns 401 — the
 * heartbeat treats anything <500 as "reachable").
 * @param page - Playwright page to attach listeners to
 * @param tag - Short prefix for log lines (e.g. test name)
 */
export const wirePageLog = (page: Page, tag: string): void => {
  wireConsole(page, tag)
  wireNetworkFailures(page, tag)
  wireMutations(page, tag)
}
