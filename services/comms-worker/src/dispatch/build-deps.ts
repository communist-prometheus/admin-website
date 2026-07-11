import { createMagazineFetcher } from '../magazine/fetch'
import { createResendClient } from '../resend/client'
import { createRssFetcher } from '../rss/fetch'
import { createSendLogRepo } from '../send-log/repo'
import { createSettingsRepo } from '../settings/repo'
import { createRepo } from '../subscribers/repo'
import {
  DEFAULT_FROM,
  DEFAULT_PUBLIC_BASE,
  type DispatchEnv,
} from './runtime-env'
import type { RunDispatchDeps } from './types'

const nowIso = (): string => new Date().toISOString()

/**
 * Materialise concrete repos + clients for one dispatch tick from the
 * worker's bindings + secrets. Pure factory — no side effects until
 * the orchestrator calls into them.
 * @param env Worker bindings + secrets.
 * @param tickAt Tick moment used as the `tick_at` stamp on send_log rows.
 * @param targetIds Optional subscriber-id subset for a targeted test send.
 * @returns Inputs for {@link runDispatch}.
 */
export const buildRuntimeDeps = (
  env: DispatchEnv,
  tickAt: Date,
  targetIds?: ReadonlyArray<number>
): RunDispatchDeps => ({
  subscriberRepo: createRepo({ db: env.DB, now: nowIso }),
  sendLogRepo: createSendLogRepo({ db: env.DB }),
  settingsRepo: createSettingsRepo({ db: env.DB }),
  rss: createRssFetcher({ base: env.CONTENT_BASE_URL }),
  magazine: createMagazineFetcher({ base: env.CONTENT_BASE_URL }),
  resend: createResendClient({ apiKey: env.RESEND_API_KEY }),
  secret: env.UNSUBSCRIBE_SECRET,
  fromAddress: env.FROM_ADDRESS ?? DEFAULT_FROM,
  publicBaseUrl: env.PUBLIC_BASE_URL ?? DEFAULT_PUBLIC_BASE,
  tickAt,
  targetIds,
})
