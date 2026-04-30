import { fs, REPO_DIR } from '../git/fs'
import { loadGit } from '../git/load-git'
import type { ResolveStrategy } from '../protocol/push-control'
import { resolveByStrategy } from './parse-markers'

const forceMineSet = new Set<string>()

/**
 * Apply the chosen strategy to a single conflicted file: rewrite
 * the working tree without conflict markers and stage the result
 * via `git.add`. Force-mine paths are remembered so the finalize
 * step can decide whether to push with the force flag.
 * @param file Path of the conflicted file (relative to repo root).
 * @param strategy User-selected resolution strategy.
 * @returns Resolves once the file is staged.
 */
export const resolveFile = async (
  file: string,
  strategy: ResolveStrategy
): Promise<void> => {
  const path = `${REPO_DIR}/${file}`
  const raw = await fs.promises.readFile(path, 'utf8')
  const content =
    typeof raw === 'string' ? raw : new TextDecoder().decode(raw)
  const next = resolveByStrategy(content, strategy)
  await fs.promises.writeFile(path, next, 'utf8')
  const git = await loadGit()
  await git.add({ fs, dir: REPO_DIR, filepath: file })
  const noop = (): void => undefined
  const remember = (): void => {
    forceMineSet.add(file)
  }
  ;(strategy === 'force-mine' ? remember : noop)()
}

/**
 * Whether any resolved file was marked force-mine, telling the
 * finalize step to issue a `git push --force-with-lease`.
 * @returns True when at least one force-mine resolution is queued.
 */
export const hasForcePending = (): boolean => forceMineSet.size > 0

/** Reset the force-mine accumulator. Called after finalize. */
export const clearForcePending = (): void => {
  forceMineSet.clear()
}
