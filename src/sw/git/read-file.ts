import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { fs, REPO_DIR } from './fs'

/**
 * Read a file from the local git working tree as UTF-8.
 * @param filepath - Path relative to repo root
 * @returns File content as string
 */
export const readRepoFile = async (filepath: string): Promise<string> => {
  const start = Date.now()
  const fullPath = `${REPO_DIR}/${filepath}`
  const data = await fs.promises.readFile(fullPath, {
    encoding: 'utf8',
  })
  recordOp('readFile', Date.now() - start)
  log('debug', 'fs', `read ${filepath}`)
  return data as string
}
