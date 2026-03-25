import { Effect } from 'effect'
import { log } from '../../logging/logger'
import { recordOp } from '../../logging/metrics'
import { workerState } from '../../state/state'
import { fs, REPO_DIR } from '../fs'
import { loadGit } from '../load-git'
import { ensureDirEffect } from './ensure-dir'

const stageFile = (filepath: string) =>
  __MOCK_MODE__ || workerState.config?.mock
    ? Effect.void
    : Effect.tryPromise(async () => {
        const git = await loadGit()
        await git.add({ fs, dir: REPO_DIR, filepath })
      })

/**
 * Write a file to the working tree and stage it.
 * Skips git staging in mock mode (no .git directory).
 * @param filepath - Path relative to repo root
 * @param content - File content as string
 * @returns Promise resolving when write and staging complete
 */
export const writeAndStage = (
  filepath: string,
  content: string
): Promise<void> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const start = Date.now()
      yield* ensureDirEffect(filepath)
      yield* Effect.tryPromise(() =>
        fs.promises.writeFile(`${REPO_DIR}/${filepath}`, content, {
          mode: 0o644,
          encoding: 'utf8',
        })
      )
      yield* stageFile(filepath)
      recordOp('writeFile', Date.now() - start)
      log('debug', 'fs', `wrote + staged ${filepath}`)
    })
  )
