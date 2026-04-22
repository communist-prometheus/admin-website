import {
  clearPendingDeploy,
  setPendingDeploy,
} from '@/composables/useDeployStatus/pending-deploy'
import type { HandleSaveDeps } from './handle-save-deps'
import { guardFrontmatter } from './validate-save'

const persist = async (
  deps: HandleSaveDeps,
  message: string
): Promise<void> => {
  if (deps.hasAssets.value) {
    await deps.blogSave(message)
    return
  }
  const path = deps.buildPath(deps.currentLang.value)
  await deps.saveCurrentLanguage(path, message)
}

/**
 * Create the save handler for the edit page.
 *
 * @param deps dependencies for saving
 * @returns an async function to invoke on Save
 */
export const createHandleSave = (deps: HandleSaveDeps) => async () => {
  const message = `updated ${deps.title.value} in ${deps.contentTypeName.value}`
  const gate = guardFrontmatter(deps)
  if (gate !== undefined) throw new Error(gate)
  setPendingDeploy(message)
  try {
    await persist(deps, message)
    deps.track?.()
    await deps.reloadContent()
  } catch (err) {
    clearPendingDeploy()
    const msg = err instanceof Error ? err.message : 'Save failed'
    deps.onError?.(msg)
    throw err
  }
}
