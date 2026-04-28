import { type Ref, ref } from 'vue'
import type { Language } from '@/types/content'

interface FormRefs {
  readonly slug: Ref<string>
  readonly title: Ref<string>
  readonly description: Ref<string>
  readonly category: Ref<string>
  readonly reset: () => void
}

interface FormSnapshot {
  readonly slug: string
  readonly lang: Language
  readonly title: string
  readonly description: string
  readonly category: string
}

/**
 * Owns the four reactive refs backing the create-dialog inputs and
 * exposes a helper for snapshotting them into the request payload
 * shape.
 *
 * @param lang - Reactive accessor for the dialog's current language
 * @returns Refs + snapshot helper bound to that language
 */
export const useCreateForm = (lang: () => Language) => {
  const slug = ref('')
  const title = ref('')
  const description = ref('')
  const category = ref('')
  const reset = (): void => {
    slug.value = ''
    title.value = ''
    description.value = ''
    category.value = ''
  }
  const snapshot = (): FormSnapshot => ({
    slug: slug.value,
    lang: lang(),
    title: title.value,
    description: description.value,
    category: category.value,
  })
  return { refs: { slug, title, description, category, reset }, snapshot }
}

export type { FormRefs, FormSnapshot }
