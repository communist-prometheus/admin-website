import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

/**
 * Recursively walk a directory in the virtual FS.
 * @param dir - Absolute directory path
 * @param base - Base path to compute relative paths
 * @returns Array of relative file paths
 */
const walkDir = async (
  dir: string,
  base: string
): Promise<readonly string[]> => {
  const entries = await fs.promises.readdir(dir)
  const results: string[] = []
  for (const entry of entries) {
    const full = `${dir}/${entry}`
    const stat = await fs.promises.stat(full)
    if (stat.isDirectory()) {
      const sub = await walkDir(full, base)
      results.push(...sub)
    } else {
      results.push(full.slice(base.length + 1))
    }
  }
  return results
}

/**
 * List all files — walks FS in mock mode, uses git in real mode.
 * @returns Array of file paths relative to repo root
 */
export const listAllFiles = async (): Promise<readonly string[]> => {
  const start = Date.now()
  let files: readonly string[]
  if (__MOCK_MODE__ || workerState.config?.mock) {
    files = await walkDir(REPO_DIR, REPO_DIR)
  } else {
    const git = await loadGit()
    files = await git.listFiles({
      fs,
      dir: REPO_DIR,
      ref: 'HEAD',
    })
  }
  recordOp('listFiles', Date.now() - start)
  log('debug', 'fs', `listed ${files.length} files`)
  return files
}

/**
 * List files under a given directory prefix.
 * @param prefix - Directory path (e.g. 'content/blog')
 * @returns Filtered file paths
 */
export const listFilesUnder = async (
  prefix: string
): Promise<readonly string[]> => {
  const all = await listAllFiles()
  const normalized = prefix.endsWith('/') ? prefix : `${prefix}/`
  return all.filter(f => f.startsWith(normalized))
}
