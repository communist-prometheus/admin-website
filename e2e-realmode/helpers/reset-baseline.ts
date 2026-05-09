import { getRef, updateRef } from '../../scripts/sandbox-gh'
import { cfg } from './sandbox-config'

/**
 * Force-reset the sandbox working branch to the immutable baseline
 * tag. Called before every test so commits/deletes from the previous
 * test do not bleed into the next one.
 *
 * No-op when the branch is already at baseline (the canary leaves
 * it pristine on success), so the cost on a clean start is one
 * read-only API call.
 * @returns Resolves when the branch matches baseline
 */
export const resetSandboxBaseline = async (): Promise<void> => {
  const baseline = await getRef(cfg, `tags/${cfg.baselineTag}`)
  if (!baseline) {
    throw new Error(
      `Baseline tag missing: tags/${cfg.baselineTag}. ` +
        `Run: bun run sandbox:setup`
    )
  }
  const head = await getRef(cfg, `heads/${cfg.branch}`)
  if (head === baseline) return
  await updateRef(cfg, `heads/${cfg.branch}`, baseline)
}
