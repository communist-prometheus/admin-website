import git from 'isomorphic-git'
import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { fs, REPO_DIR } from './fs'

/**
 * Delete a file from the working tree and remove from index.
 * @param filepath - Path relative to repo root
 */
export const deleteAndUnstage = async (filepath: string): Promise<void> => {
  const start = Date.now()

  try {
    await fs.promises.unlink(`${REPO_DIR}/${filepath}`)
  } catch {
    /* file may not exist on disk */
  }

  await git.remove({ fs, dir: REPO_DIR, filepath })
  recordOp('deleteFile', Date.now() - start)
  log('debug', 'fs', `deleted + unstaged ${filepath}`)
}
