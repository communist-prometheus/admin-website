import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { workerState } from '../state'
import { fs, REPO_DIR } from './fs'
import { loadGit } from './load-git'

/**
 * Delete a file from the working tree and remove from index.
 * Skips git unstaging in mock mode (no .git directory).
 * @param filepath - Path relative to repo root
 */
export const deleteAndUnstage = async (filepath: string): Promise<void> => {
  const start = Date.now()

  try {
    await fs.promises.unlink(`${REPO_DIR}/${filepath}`)
  } catch {
    /* file may not exist on disk */
  }

  if (!__MOCK_MODE__ && !workerState.config?.mock) {
    const git = await loadGit()
    await git.remove({ fs, dir: REPO_DIR, filepath })
  }
  recordOp('deleteFile', Date.now() - start)
  log('debug', 'fs', `deleted + unstaged ${filepath}`)
}
