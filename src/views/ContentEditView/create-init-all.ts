import type { ComputedRef, Ref } from 'vue'

interface InitAllDeps {
  readonly initEditor: () => Promise<void>
  readonly isBlog: ComputedRef<boolean>
  readonly frontmatterData: Ref<Record<string, unknown>>
  readonly coverPath: Ref<string | undefined>
  readonly loadAssets: () => Promise<void>
}

/**
 * Create the init-all async function for edit page.
 * @param deps - Dependencies for initialization
 * @returns Async init function
 */
export const createInitAll = (deps: InitAllDeps) => async () => {
  await deps.initEditor()
  if (!deps.isBlog.value) return
  const img = deps.frontmatterData.value.image
  deps.coverPath.value = typeof img === 'string' ? img : undefined
  await deps.loadAssets()
}
