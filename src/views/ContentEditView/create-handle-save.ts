import { Either } from 'effect'
import type { ComputedRef, Ref } from 'vue'
import type { TrackDeploy } from '@/composables/useDeployStatus/deploy-context'
import {
  clearPendingDeploy,
  setPendingDeploy,
} from '@/composables/useDeployStatus/pending-deploy'
import type { ContentType, Language } from '@/types/content'
import { validateFrontmatter } from '@/validation/schemas/frontmatter'

interface HandleSaveDeps {
  readonly hasAssets: ComputedRef<boolean>
  readonly blogSave: (message: string) => Promise<string>
  readonly buildPath: (lang: Language) => string
  readonly currentLang: Ref<Language>
  readonly saveCurrentLanguage: (
    path: string,
    message: string
  ) => Promise<void>
  readonly reloadContent: () => Promise<void>
  readonly title: ComputedRef<string>
  readonly contentType: ComputedRef<ContentType>
  readonly frontmatter: () => Record<string, unknown>
  readonly contentTypeName: ComputedRef<string>
  readonly track?: TrackDeploy
  readonly onError?: (msg: string) => void
}

const guard = (deps: HandleSaveDeps): string | undefined => {
  const result = validateFrontmatter(
    deps.contentType.value,
    deps.frontmatter()
  )
  return Either.isLeft(result) ? result.left : undefined
}

/**
 * Create the save handler for the edit page.
 *
 * @param deps dependencies for saving
 * @returns an async function to invoke on Save
 */
export const createHandleSave = (deps: HandleSaveDeps) => async () => {
  const message = `updated ${deps.title.value} in ${deps.contentTypeName.value}`
  const gate = guard(deps)
  if (gate !== undefined) {
    throw new Error(gate)
  }
  setPendingDeploy(message)
  try {
    if (deps.hasAssets.value) await deps.blogSave(message)
    else {
      const path = deps.buildPath(deps.currentLang.value)
      await deps.saveCurrentLanguage(path, message)
    }
    deps.track?.()
    await deps.reloadContent()
  } catch (err) {
    clearPendingDeploy()
    const msg = err instanceof Error ? err.message : 'Save failed'
    deps.onError?.(msg)
    throw err
  }
}
