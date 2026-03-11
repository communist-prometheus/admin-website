import git from 'isomorphic-git'
import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { fs, REPO_DIR } from './fs'

/**
 * List all tracked files in the repository.
 * @returns Array of file paths relative to repo root
 */
export const listAllFiles = async (): Promise<readonly string[]> => {
  const start = Date.now()
  const files = await git.listFiles({
    fs,
    dir: REPO_DIR,
    ref: 'HEAD',
  })
  recordOp('listFiles', Date.now() - start)
  log('debug', 'fs', `listed ${files.length} files`)
  return files
}

/**
 * List tracked files under a given directory prefix.
 * @param prefix - Directory path (e.g. 'src/content/blog')
 * @returns Filtered file paths
 */
export const listFilesUnder = async (
  prefix: string
): Promise<readonly string[]> => {
  const all = await listAllFiles()
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`
  return all.filter(f => f.startsWith(normalized))
}
