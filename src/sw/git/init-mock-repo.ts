import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import type { MockEntry } from '../mock/all-entries'
import { allMockEntries } from '../mock/all-entries'
import { fs, REPO_DIR } from './fs'

/**
 * Collect unique directory paths that need to be created.
 * @param entries - Mock file entries
 * @returns Sorted set of directory paths
 */
const collectDirs = (entries: readonly MockEntry[]): readonly string[] => {
  const dirs = new Set<string>()
  for (const e of entries) {
    const parts = e.path.split('/')
    let current = REPO_DIR
    for (const part of parts.slice(0, -1)) {
      current = `${current}/${part}`
      dirs.add(current)
    }
  }
  return [...dirs].sort()
}

/**
 * Create all directories and write all files in parallel.
 * @param entries - Mock file entries
 */
const writeAllFiles = async (entries: readonly MockEntry[]) => {
  for (const dir of collectDirs(entries)) {
    await fs.promises.mkdir(dir).catch(() => {})
  }
  await Promise.all(
    entries.map(e =>
      fs.promises.writeFile(`${REPO_DIR}/${e.path}`, e.content, {
        mode: 0o644,
        encoding: 'utf8',
      })
    )
  )
}

/**
 * Initialize mock data by writing files to the virtual FS.
 * No git operations — handlers use FS walk for listing.
 * @returns 'mock' identifier string
 */
export const initMockRepo = async (): Promise<string> => {
  const start = Date.now()
  log('info', 'git', 'Initializing mock repository')

  await fs.promises.mkdir(REPO_DIR).catch(() => {})
  await writeAllFiles(allMockEntries)

  recordOp('initMock', Date.now() - start)
  log('info', 'git', 'Mock repo ready')
  return 'mock'
}
