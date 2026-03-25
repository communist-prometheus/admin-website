import { log } from '../../logging/logger'
import { fs, REPO_DIR } from '../fs'

/**
 * Recursively remove all entries under REPO_DIR.
 * Called before clone when stale files from a previous
 * session (e.g. mock data) would conflict with checkout.
 */
export const wipeRepo = async (): Promise<void> => {
  try {
    const entries = await fs.promises.readdir(REPO_DIR)
    for (const entry of entries) {
      const full = `${REPO_DIR}/${entry}`
      const stat = await fs.promises.stat(full)
      if (stat.isDirectory()) {
        await rmDir(full)
      } else {
        await fs.promises.unlink(full)
      }
    }
    log('info', 'git', 'Wiped stale repo dir')
  } catch {
    /* dir doesn't exist — nothing to wipe */
  }
}

/**
 * Recursively remove a directory and its contents.
 * @param dir - Absolute path to remove
 */
const rmDir = async (dir: string): Promise<void> => {
  const entries = await fs.promises.readdir(dir)
  for (const entry of entries) {
    const full = `${dir}/${entry}`
    const stat = await fs.promises.stat(full)
    if (stat.isDirectory()) {
      await rmDir(full)
    } else {
      await fs.promises.unlink(full)
    }
  }
  await fs.promises.rmdir(dir)
}
