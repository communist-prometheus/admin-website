import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { globSync } from 'tinyglobby'

const EARS_RE = /\bR\d+\.\d+\b/g

/**
 * EARS ids that live in infra / policy rather than worker code, so a
 * code-coverage scan can never see them. Documented here instead of
 * being silently dropped by the audit.
 */
const KNOWN_NON_CODE_IDS: ReadonlySet<string> = new Set(['R6.6', 'R6.7'])

/** Extract every unique `R<n>.<m>` token from a single file. */
const idsIn = (path: string): ReadonlySet<string> =>
  new Set(readFileSync(path, 'utf8').match(EARS_RE) ?? [])

/** Aggregate EARS ids referenced across all files matched by `glob`. */
export const idsAcross = (cwd: string, glob: string): ReadonlySet<string> => {
  const merged = new Set<string>()
  for (const file of globSync(glob, { cwd, absolute: true })) {
    for (const id of idsIn(file)) merged.add(id)
  }
  return merged
}

/**
 * Find EARS ids declared in requirements but never referenced in
 * `tasks.md` or any test file under `services/comms-worker/`.
 * @param cwd Repository root.
 * @returns Sorted list of orphan ids.
 */
export const findOrphans = (cwd: string): ReadonlyArray<string> => {
  const reqs = idsIn(resolve(cwd, 'specs/comms-newsletter/requirements.md'))
  const tasks = idsIn(resolve(cwd, 'specs/comms-newsletter/tasks.md'))
  const tests = idsAcross(cwd, 'services/comms-worker/src/**/*.test.ts')
  const covered = new Set([...tasks, ...tests, ...KNOWN_NON_CODE_IDS])
  return [...reqs].filter(id => !covered.has(id)).sort()
}
