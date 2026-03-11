import git from 'isomorphic-git'
import { fs, REPO_DIR } from './fs'

/**
 * Check if a git repository already exists in IndexedDB.
 * @returns true if HEAD can be resolved
 */
export const checkRepoExists = async (): Promise<boolean> => {
  try {
    await git.resolveRef({ fs, dir: REPO_DIR, ref: 'HEAD' })
    return true
  } catch {
    return false
  }
}
