import { computed, ref } from 'vue'
import type { ContentType } from '@/types/content'
import { willPublish } from './will-publish'

interface Deps {
  readonly contentType: () => ContentType
  readonly frontmatter: () => Record<string, unknown>
  readonly handleSave: () => Promise<void>
  readonly saveError: { readonly value: string | null }
  readonly exitPreview: () => void
}

/**
 * Owns the Save-from-Preview flow: opens a confirmation dialog when
 * the save would publish to the live site; triggers handleSave on
 * confirm; closes preview on success.
 *
 * @param deps contentType accessor, frontmatter accessor, save
 *             handler from initEditPage, saveError ref, exitPreview
 * @returns reactive dialog state + user-facing handlers
 */
export const useSaveFlow = (deps: Deps) => {
  const showDialog = ref(false)
  const autoPublic = computed(
    () => deps.contentType() === 'pages' || deps.contentType() === 'common'
  )

  const commit = async () => {
    await deps.handleSave()
    if (deps.saveError.value === null) deps.exitPreview()
  }

  const onSave = async () => {
    if (willPublish(deps.contentType(), deps.frontmatter())) {
      showDialog.value = true
      return
    }
    await commit()
  }

  const onConfirm = async () => {
    showDialog.value = false
    await commit()
  }

  const onCancel = () => {
    showDialog.value = false
  }

  return { showDialog, autoPublic, onSave, onConfirm, onCancel }
}
