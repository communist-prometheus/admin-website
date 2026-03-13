import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { fs, REPO_DIR } from './fs'

/**
 * Read a file from the working tree as raw binary.
 * @param filepath - Path relative to repo root
 * @returns File content as Uint8Array
 */
export const readRepoBinaryFile = async (
  filepath: string
): Promise<Uint8Array> => {
  const start = Date.now()
  const fullPath = `${REPO_DIR}/${filepath}`
  const data = await fs.promises.readFile(fullPath)
  recordOp('readBinaryFile', Date.now() - start)
  log('debug', 'fs', `read binary ${filepath}`)
  if (data instanceof Uint8Array) return data
  const encoder = new TextEncoder()
  return encoder.encode(String(data))
}
