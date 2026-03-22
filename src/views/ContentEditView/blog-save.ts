import { transactionalSave } from '@/composables/useAssets/transactional-save'
import type { useAssets } from '@/composables/useAssets/useAssets'
import { stringifyFrontmatter } from '@/utils/frontmatter/stringify'

type Assets = ReturnType<typeof useAssets>

interface AssetSaveDeps {
  readonly assets: Assets
  readonly frontmatter: () => Record<string, unknown>
  readonly body: () => string
  readonly buildPath: () => string
  readonly markSaved: () => void
  readonly type: string
  readonly slug: string
}

/**
 * Create a save handler with transactional commit for content with assets.
 * @param deps - Dependencies for save
 * @returns Async save function accepting commit message
 */
export const createBlogSave =
  (deps: AssetSaveDeps) =>
  async (message: string): Promise<void> => {
    const fm = { ...deps.frontmatter() }
    const cover = deps.assets.coverPath.value
    if (cover) fm.image = cover
    else delete fm.image
    const content = stringifyFrontmatter(fm, deps.body())
    await transactionalSave({
      type: deps.type,
      slug: deps.slug,
      articlePath: deps.buildPath(),
      articleContent: content,
      message,
      pendingAdds: deps.assets.pendingAdds.value,
      pendingDeletes: deps.assets.pendingDeletes.value,
    })
    deps.markSaved()
    deps.assets.resetPending()
    await deps.assets.loadAssets()
  }
