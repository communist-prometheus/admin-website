import { getCommsBase } from '@/config/comms'

/**
 * Build an absolute URL pointing at the comms-worker.
 * @param path Path beginning with `/`.
 * @returns Fully-qualified URL.
 */
export const commsUrl = (path: string): string => `${getCommsBase()}${path}`

/**
 * Standard JSON content-type headers used by every comms POST/PATCH.
 * @returns Headers object with `Content-Type: application/json`.
 */
export const jsonHeaders = (): HeadersInit => ({
  'Content-Type': 'application/json',
})

/**
 * Pass-through that throws when the response status is non-2xx.
 * @param res The fetch response.
 * @param step Human-readable label included in the error message.
 * @returns The same response when ok.
 */
export const ensureOk = (res: Response, step: string): Response =>
  res.ok
    ? res
    : (() => {
        throw new Error(`${step} failed: ${res.status}`)
      })()
