import { commitStaged } from '@/composables/useGitHubApi/commit-staged'
import { stageFile } from '@/composables/useGitHubApi/stage-file'
import { fetchContentItems } from './content-fetch'
import { buildSeed } from './seed-build'

const stageAll = async (newLangs: readonly string[]): Promise<number> => {
  let count = 0
  for (const type of ['pages', 'common'] as const) {
    const items = await fetchContentItems(type)
    for (const seed of buildSeed(type, items, newLangs)) {
      await stageFile(seed.path, seed.content)
      count += 1
    }
  }
  return count
}

const finalise = async (
  count: number,
  newLangs: readonly string[]
): Promise<number> => {
  const message = `Seed ${count} translation file(s) for ${newLangs.join(', ')}`
  return count === 0 ? 0 : commitStaged(message).then(() => count)
}

/**
 * Stage and commit translation seeds for newly-added languages.
 *
 * For each fixed-structure content type (`pages`, `common`), enumerate
 * every existing slug and stage an empty-body file for each new lang
 * that doesn't yet have one. Frontmatter cloned from a same-slug
 * template (prefer `en`, else first available). Single commit covers
 * all paths so the SW pushes one push.
 *
 * @param newLangs - Lang codes that just got added in Settings
 * @returns Number of files staged + committed
 */
export const seedNewLanguages = async (
  newLangs: readonly string[]
): Promise<number> =>
  newLangs.length === 0 ? 0 : finalise(await stageAll(newLangs), newLangs)
