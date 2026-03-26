import type { Ref } from 'vue'
import type { LabelEntry } from '@/validation/schemas/labels'
import { fetchLabelsFile, parseLabels } from './labels-api'

/**
 * Create loader that fetches and parses labels.
 * @param labels - Reactive labels ref
 * @param fileSha - Reactive file SHA ref
 * @param loading - Reactive loading ref
 * @param loaded - Reactive loaded ref
 * @returns Async function that loads labels
 */
export const createLoadLabels =
  (
    labels: Ref<readonly LabelEntry[]>,
    fileSha: Ref<string>,
    loading: Ref<boolean>,
    loaded: Ref<boolean>
  ) =>
  async (): Promise<void> => {
    loading.value = true
    try {
      const file = await fetchLabelsFile()
      if (file) {
        labels.value = parseLabels(file.content)
        fileSha.value = file.sha
      }
      loaded.value = true
    } finally {
      loading.value = false
    }
  }
