import { Effect } from 'effect'
import { fs, REPO_DIR } from '../fs'

const parentDirs = (filepath: string): readonly string[] => {
  const parts = filepath.split('/').slice(0, -1)
  const dirs: string[] = []
  for (const part of parts) dirs.push(`${dirs.at(-1) ?? REPO_DIR}/${part}`)
  return dirs
}

/**
 * Create parent directories, ignoring already-exists errors.
 * @param filepath - Path relative to repo root
 * @returns Effect creating all needed parent dirs
 */
export const ensureDirEffect = (filepath: string) =>
  Effect.forEach(parentDirs(filepath), dir =>
    Effect.tryPromise(() => fs.promises.mkdir(dir)).pipe(
      Effect.catchAll(() => Effect.void)
    )
  )
