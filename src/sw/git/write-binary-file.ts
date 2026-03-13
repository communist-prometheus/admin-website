import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { workerState } from '../state'
import { fs, REPO_DIR } from './fs'
import { loadGit } from './load-git'

/**
 * Ensure parent directories exist for a given file path.
 * @param filepath - Path relative to repo root
 */
const ensureBinaryDir = async (filepath: string): Promise<void> => {
  const parts = filepath.split('/')
  let current = REPO_DIR
  for (const part of parts.slice(0, -1)) {
    current = `${current}/${part}`
    await fs.promises.mkdir(current).catch(() => {})
  }
}

/**
 * Write binary data to the working tree and stage it.
 * @param filepath - Path relative to repo root
 * @param data - Binary content
 */
export const writeBinaryAndStage = async (
  filepath: string,
  data: Uint8Array
): Promise<void> => {
  const start = Date.now()
  await ensureBinaryDir(filepath)
  await fs.promises.writeFile(`${REPO_DIR}/${filepath}`, data, {
    mode: 0o644,
  })
  if (!__MOCK_MODE__ && !workerState.config?.mock) {
    const git = await loadGit()
    await git.add({ fs, dir: REPO_DIR, filepath })
  }
  recordOp('writeBinaryFile', Date.now() - start)
  log('debug', 'fs', `wrote binary + staged ${filepath}`)
}
