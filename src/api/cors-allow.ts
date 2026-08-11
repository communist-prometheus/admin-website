const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  'https://admin.comprom.org',
  'https://dev-admin.comprom.org',
])

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

/**
 * Decide whether a browser Origin may use the CORS proxy. Only the
 * admin app origins (prod, develop, local dev/e2e) are allowed —
 * reflecting arbitrary origins would make the proxy usable from any
 * website in a visitor's browser.
 * @param origin - Value of the Origin request header
 * @returns true when the origin belongs to the admin app
 */
export const isAllowedOrigin = (origin: string): boolean =>
  ALLOWED_ORIGINS.has(origin) || LOCAL_ORIGIN.test(origin)

/*
 * isomorphic-git only ever needs the git smart-HTTP endpoints on
 * github.com: ref discovery + upload-pack (clone/pull) +
 * receive-pack (push). Anything else through the proxy would turn it
 * into an SSRF relay that forwards Authorization headers to
 * arbitrary hosts.
 */
const GIT_SMART_HTTP =
  /^github\.com\/[\w.-]+\/[\w.-]+\/(info\/refs|git-upload-pack|git-receive-pack)$/

/**
 * Validate the proxied target path. Pins the proxy to GitHub's git
 * smart-HTTP endpoints — host allowlist and path restriction in one.
 * @param path - Target path after the /api/cors/ prefix
 * @returns true when the path is a github.com git smart-HTTP endpoint
 */
export const isAllowedTarget = (path: string): boolean =>
  GIT_SMART_HTTP.test(path)
