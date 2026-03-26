import { ref } from 'vue'
import type { LabelEntry } from '@/validation/schemas/labels'
import { createLoadLabels } from './labels-load'
import { createUpdateLabels } from './labels-update'

/**
 * Create the reactive state and actions for labels store.
 * @returns Store state, getters, and actions
 */
export const createLabelsState = () => {
  const labels = ref<readonly LabelEntry[]>([])
  const fileSha = ref('')
  const loading = ref(false)
  const loaded = ref(false)
  const loadLabels = createLoadLabels(labels, fileSha, loading, loaded)

  return {
    labels,
    fileSha,
    loading,
    loaded,
    loadLabels,
    updateLabels: createUpdateLabels(labels, fileSha),
  }
}
