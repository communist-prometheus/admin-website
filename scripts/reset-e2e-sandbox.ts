import 'dotenv/config'
import process from 'node:process'
import { readSandboxConfig } from './sandbox-config'
import { getRef, updateRef } from './sandbox-gh'

const log = (s: string): void => process.stdout.write(`${s}\n`)

const main = async (): Promise<void> => {
  const cfg = readSandboxConfig()
  const baselineSha = await getRef(cfg, `tags/${cfg.baselineTag}`)
  if (!baselineSha) {
    throw new Error(
      `baseline tag missing: tags/${cfg.baselineTag}. ` +
        `Run: bun scripts/setup-e2e-sandbox.ts`
    )
  }
  const headSha = await getRef(cfg, `heads/${cfg.branch}`)
  if (headSha === baselineSha) {
    log(`branch already at baseline (${baselineSha.slice(0, 7)})`)
    return
  }
  log(
    `force-resetting heads/${cfg.branch}: ` +
      `${(headSha ?? '<none>').slice(0, 7)} → ${baselineSha.slice(0, 7)}`
  )
  await updateRef(cfg, `heads/${cfg.branch}`, baselineSha)
  log('reset complete.')
}

main().catch(err => {
  process.stderr.write(
    `${err instanceof Error ? err.message : String(err)}\n`
  )
  process.exit(1)
})
