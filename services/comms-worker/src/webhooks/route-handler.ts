import type { Context } from 'hono'
import { createSendLogRepo } from '../send-log/repo'
import { createRepo } from '../subscribers/repo'
import { applyResendEvent, type ResendEvent } from './handler'
import type { WebhookEnv } from './runtime-env'
import { verifyWebhookSignature } from './svix'

const readSignatureInputs = (c: Context, body: string) => ({
  id: c.req.header('svix-id') ?? '',
  timestamp: c.req.header('svix-timestamp') ?? '',
  signatureHeader: c.req.header('svix-signature') ?? '',
  body,
})

const parseEvent = (body: string): ResendEvent | undefined => {
  try {
    return JSON.parse(body) as ResendEvent
  } catch {
    return undefined
  }
}

/**
 * Build the `POST /webhooks/resend` request handler bound to a
 * deterministic `now` source (for tests).
 * @param now Clock returning the current epoch in ms.
 * @returns Hono handler.
 */
export const buildWebhookHandler =
  (now: () => number) =>
  async (c: Context): Promise<Response> => {
    const env = c.env as WebhookEnv
    const body = await c.req.text()
    const valid = await verifyWebhookSignature({
      ...readSignatureInputs(c, body),
      secret: env.RESEND_WEBHOOK_SECRET,
      nowMs: now(),
    })
    if (!valid) return c.body(null, 401)
    const event = parseEvent(body)
    if (event === undefined) return c.body(null, 200)
    await applyResendEvent(
      createRepo({ db: env.DB, now: () => new Date().toISOString() }),
      createSendLogRepo({ db: env.DB }),
      event
    )
    return c.body(null, 200)
  }
