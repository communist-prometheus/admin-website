import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'

/**
 * Ensure parent directories exist for a given file path.
 * @param filepath - Path relative to repo root
 */
const ensureDir = async (filepath: string): Promise<void> => {
  const parts = filepath.split('/')
  let current = REPO_DIR
  for (const part of parts.slice(0, -1)) {
    current = `${current}/${part}`
    try {
      await fs.promises.mkdir(current)
    } catch {
      /* directory exists */
    }
  }
}

/**
 * Write a file to the working tree and stage it.
 * Skips git staging in mock mode (no .git directory).
 * @param filepath - Path relative to repo root
 * @param content - File content as string
 */
export const writeAndStage = async (
  filepath: string,
  content: string
): Promise<void> => {
  const start = Date.now()
  await ensureDir(filepath)
  await fs.promises.writeFile(`${REPO_DIR}/${filepath}`, content, {
    mode: 0o644,
    encoding: 'utf8',
  })
  if (!__MOCK_MODE__ && !workerState.config?.mock) {
    const git = await loadGit()
    await git.add({ fs, dir: REPO_DIR, filepath })
  }
  recordOp('writeFile', Date.now() - start)
  log('debug', 'fs', `wrote + staged ${filepath}`)
}
