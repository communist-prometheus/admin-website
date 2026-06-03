const envBase = (): string => {
  const v = import.meta.env.VITE_COMMS_BASE
  return typeof v === 'string' && v.length > 0 ? v.replace(/\/$/, '') : ''
}

const defaultBase = (): string =>
  import.meta.env.DEV ? 'http://localhost:8787' : 'https://lists.comprom.org'

/**
 * Read the comms-worker base URL from Vite env. Defaults to the
 * production custom-domain route declared in
 * `services/comms-worker/wrangler.jsonc`. Use VITE_COMMS_BASE in
 * dev/e2e to point at a local `wrangler dev` instance.
 * @returns Origin (no trailing slash) of the comms worker.
 */
export const getCommsBase = (): string => envBase() || defaultBase()
