import 'dotenv/config'
import { readSandboxConfig } from '../scripts/sandbox-config'
import { getRef, updateRef } from '../scripts/sandbox-gh'

/**
 * Reset the sandbox branch to its baseline tag before the suite runs.
 * Avoids per-test reset (slow) while still guaranteeing a known
 * starting point for every CI run.
 * @returns Resolves once branch is reset
 */
const main = async (): Promise<void> => {
  const cfg = readSandboxConfig()
  const baseline = await getRef(cfg, `tags/${cfg.baselineTag}`)
  if (!baseline) {
    throw new Error(
      `Baseline tag missing: tags/${cfg.baselineTag}. ` +
        `Run: bun run sandbox:setup`
    )
  }
  const head = await getRef(cfg, `heads/${cfg.branch}`)
  if (head === baseline) return
  process.stdout.write(
    `[realmode] resetting heads/${cfg.branch}: ` +
      `${(head ?? '<none>').slice(0, 7)} → ${baseline.slice(0, 7)}\n`
  )
  await updateRef(cfg, `heads/${cfg.branch}`, baseline)
}

export default main
