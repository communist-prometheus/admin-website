import { Effect } from 'effect'
import { rethrow } from '@/utils/rethrow'
import { fs, REPO_DIR } from '../fs'

const isDirAlreadyExists = (e: unknown): boolean =>
  typeof e === 'object' &&
  e !== null &&
  'code' in e &&
  (e as { code: string }).code === 'EEXIST'

const parentDirs = (filepath: string): readonly string[] => {
  const parts = filepath.split('/').slice(0, -1)
  const dirs: string[] = []
  for (const part of parts) dirs.push(`${dirs.at(-1) ?? REPO_DIR}/${part}`)
  return dirs
}

/**
 * Idempotent `mkdir` for the lightning-fs working tree.
 *
 * Only swallows EEXIST — every other error (permission, IO, parent
 * missing) propagates. The previous `mkdir(...).catch(() => {})`
 * pattern across the SW silently masked real failures along with the
 * already-exists case; centralising the EEXIST-only handler here is
 * how we kill that antipattern site by site.
 * @param path - Absolute working-tree path to create
 */
export const ensureDir = async (path: string): Promise<void> => {
  try {
    await fs.promises.mkdir(path)
  } catch (e) {
    void (isDirAlreadyExists(e) ? 0 : rethrow(e))
  }
}

/**
 * Effect-flavoured variant of {@link ensureDir} that walks up the
 * parent chain of `filepath` and creates each segment. Used by the
 * stage write pipeline.
 * @param filepath - Path relative to repo root
 * @returns Effect creating all needed parent dirs
 */
export const ensureDirEffect = (filepath: string) =>
  Effect.forEach(parentDirs(filepath), dir =>
    Effect.tryPromise({
      try: () => fs.promises.mkdir(dir),
      catch: e => (e instanceof Error ? e : new Error(String(e))),
    }).pipe(
      Effect.catchAll(e =>
        isDirAlreadyExists(e) ? Effect.void : Effect.fail(e)
      )
    )
  )
