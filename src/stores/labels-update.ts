import type { Ref } from 'vue'
import type { LabelEntry } from '@/validation/schemas/labels'
import { saveLabelsFile } from './labels-api'

/**
 * Create updater that saves labels to the API.
 * @param labels - Reactive labels ref
 * @param fileSha - Reactive file SHA ref
 * @returns Async function that updates labels
 */
export const createUpdateLabels =
  (labels: Ref<readonly LabelEntry[]>, fileSha: Ref<string>) =>
  async (entries: readonly LabelEntry[]): Promise<boolean> => {
    const res = await saveLabelsFile(entries, fileSha.value)
    if (res.ok) {
      labels.value = entries
      const data = await res.json()
      fileSha.value = data.content?.sha ?? fileSha.value
    }
    return res.ok
  }
