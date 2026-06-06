import { redactPayload } from './redact'

export { maskEmail, scrubTokenQuery } from './redact'

const sink = (line: string): void => {
  console.log(line)
}

/**
 * Emit one canonical-JSON event line to `console.log` (which CF
 * Workers captures as Workers Logs). Token query params and email
 * fields are scrubbed before serialisation (R6.3, R6.5).
 * @param evt Short event tag, e.g. `tick.start` / `webhook.applied`.
 * @param payload Optional structured payload; PII fields are masked.
 * @returns Nothing — pure side effect.
 */
export const logEvent = (
  evt: string,
  payload: Readonly<Record<string, unknown>> = {}
): void => {
  sink(JSON.stringify({ evt, ...redactPayload(payload) }))
}
