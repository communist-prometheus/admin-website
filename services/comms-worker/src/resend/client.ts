import { sendBatchWithRetry } from './batch-retry'
import { sendWithRetry } from './send-retry'
import type { BatchResult, ResendClient, SendInput } from './types'

export { RESEND_API_URL } from './attempt'

type Deps = {
  readonly apiKey: string
  readonly fetch?: typeof fetch
  readonly sleep?: (ms: number) => Promise<void>
}

const defaultSleep = (ms: number): Promise<void> =>
  new Promise(r => setTimeout(r, ms))

const empty = (): Promise<BatchResult> =>
  Promise.resolve({ ok: true, ids: [] })

/**
 * Build a send client. `send` retries once on 429 / 5xx / network;
 * `sendBatch` ships ≤100 emails in one `/emails/batch` request (one HTTP
 * call → no per-second rate-limit burst) with the same single retry.
 * @param d Injected API key, fetch, and sleep for testability.
 * @returns Single + batch send client.
 */
export const createResendClient = (d: Deps): ResendClient => {
  const doFetch = d.fetch ?? globalThis.fetch.bind(globalThis)
  const doSleep = d.sleep ?? defaultSleep
  return {
    send: (input: SendInput) =>
      sendWithRetry(doFetch, doSleep, d.apiKey, input),
    sendBatch: (inputs: ReadonlyArray<SendInput>, idempotencyKey?: string) =>
      inputs.length === 0
        ? empty()
        : sendBatchWithRetry(
            doFetch,
            doSleep,
            d.apiKey,
            inputs,
            idempotencyKey
          ),
  }
}
