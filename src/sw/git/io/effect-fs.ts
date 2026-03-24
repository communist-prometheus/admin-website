import { Effect } from 'effect'
import { IOError } from '../../errors'
import { fs, REPO_DIR } from '../fs'

/**
 * Read a file from the repo as UTF-8 string.
 * @param filepath - Relative path within REPO_DIR
 * @returns Effect yielding file content string
 */
export const readFileEffect = (
  filepath: string
): Effect.Effect<string, IOError> =>
  Effect.tryPromise({
    try: () =>
      fs.promises.readFile(`${REPO_DIR}/${filepath}`, 'utf8').then(String),
    catch: cause => new IOError({ path: filepath, cause }),
  })

/**
 * Write a file to the repo.
 * @param filepath - Relative path within REPO_DIR
 * @param content - File content string
 * @returns Effect yielding void
 */
export const writeFileEffect = (
  filepath: string,
  content: string
): Effect.Effect<void, IOError> =>
  Effect.tryPromise({
    try: () =>
      fs.promises.writeFile(`${REPO_DIR}/${filepath}`, content, 'utf8'),
    catch: cause => new IOError({ path: filepath, cause }),
  })
