const envBase = (): string => {
  const v = import.meta.env.VITE_AUTH_BASE
  return typeof v === 'string' && v.length > 0
    ? v.replace(/\/$/, '')
    : ''
}

const defaultBase = (): string =>
  import.meta.env.DEV ? 'http://localhost:8788' : 'https://auth.comprom.org'

/**
 * Read the auth-worker base URL from Vite env. Defaults to the
 * production custom-domain route declared in
 * `services/auth-worker/wrangler.jsonc`. Override with
 * `VITE_AUTH_BASE` for dev/e2e setups that run a local `wrangler
 * dev` instance on a different port.
 * @returns Origin (no trailing slash) of the auth worker.
 */
export const getAuthBase = (): string => envBase() || defaultBase()
