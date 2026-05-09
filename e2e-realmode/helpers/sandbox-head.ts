import { getRef } from '../../scripts/sandbox-gh'
import { cfg } from './sandbox-config'

/**
 * Resolve the current head SHA on the sandbox branch.
 * @returns SHA the working branch points at
 */
export const headSha = async (): Promise<string> => {
  const sha = await getRef(cfg, `heads/${cfg.branch}`)
  if (!sha) throw new Error(`heads/${cfg.branch} not found`)
  return sha
}

/**
 * Poll the sandbox HEAD until it differs from `previous`. The SW push
 * queue is asynchronous: a green "Saved" badge in the UI only proves
 * the local commit landed, not the network push. This polls the real
 * GitHub ref so a hung or rejected push fails loudly instead of
 * silently passing the test.
 * @param previous - SHA the branch was at before the action
 * @param maxMs - Hard ceiling for the poll (default 60s)
 * @returns The new SHA once the push lands
 */
export const waitForHeadAdvance = async (
  previous: string,
  maxMs = 60_000
): Promise<string> => {
  const start = Date.now()
  while (true) {
    const current = await headSha()
    if (current !== previous) return current
    if (Date.now() - start > maxMs) {
      throw new Error(
        `heads/${cfg.branch} stayed at ${previous.slice(0, 7)} after ` +
          `${maxMs}ms — push never landed.`
      )
    }
    await new Promise(r => setTimeout(r, 500))
  }
}
