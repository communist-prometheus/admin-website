import { sendOnce } from './attempt'
import { buildRequest } from './request'
import type { ResendClient, SendInput, SendResult } from './types'

export { RESEND_API_URL } from './attempt'

type Deps = {
  readonly apiKey: string
  readonly fetch?: typeof fetch
  readonly sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise(r => setTimeout(r, ms))

const fail = (error: string): SendResult => ({ ok: false, error })

/**
 * Build a send-only Resend client. Retries once on 429 / 5xx / network
 * error with either the server-provided `Retry-After` or a 1s default.
 * @param d Injected API key, fetch, and sleep for testability.
 * @returns Send-only client.
 */
export const createResendClient = (d: Deps): ResendClient => {
  const doFetch = d.fetch ?? globalThis.fetch.bind(globalThis)
  const doSleep = d.sleep ?? defaultSleep
  return {
    send: async (input: SendInput) => {
      const init = buildRequest(d.apiKey, input)
      const first = await sendOnce(doFetch, init)
      if ('ok' in first) return first
      await doSleep(first.retryAfterMs)
      const second = await sendOnce(doFetch, init)
      return 'ok' in second ? second : fail('resend retry exhausted')
    },
  }
}
