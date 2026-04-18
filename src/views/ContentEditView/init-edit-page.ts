import { inject, ref } from 'vue'
import { DEPLOY_TRACK_KEY } from '@/composables/useDeployStatus/deploy-context'
import { buildInitAll } from './build-init-deps'
import { buildRawSave } from './build-raw-save'
import { setupLifecycle } from './setup-lifecycle'
import type { useEditPage } from './useEditPage'
import { wrapSave } from './wrap-save'

type Page = ReturnType<typeof useEditPage>

const toMessage = (e: unknown): string =>
  e instanceof Error ? e.message : String(e)

/**
 * Set up mount/watch hooks and save handler.
 * Save errors are captured into `saveError` so the view can surface
 * them via `<ErrorMessage>`; `saving` always resets via wrapSave's
 * try/finally.
 * @param page - Edit page state from useEditPage
 * @returns Save handler + saving/saved/saveError state
 */
export const initEditPage = (page: Page) => {
  const track = inject(DEPLOY_TRACK_KEY, undefined)
  const saving = ref(false)
  const saved = ref(false)
  const saveError = ref<string | null>(null)
  const wrapped = wrapSave(buildRawSave(page, track), saving, saved)
  const handleSave = async (): Promise<void> => {
    saveError.value = null
    try {
      await wrapped()
    } catch (e) {
      saveError.value = toMessage(e)
    }
  }
  setupLifecycle(page, buildInitAll(page))
  return { handleSave, saving, saved, saveError }
}
