import { ref } from 'vue'
import type { LinkEntry } from '@/validation/schemas/links'
import { createLoadLinks } from './links-load'
import { createUpdateLinks } from './links-update'

/**
 * Reactive state + actions for the links store (mirrors the labels
 * store): the editable entries, the group order, the file SHA for
 * conflict-safe writes, and load/update actions over the SW bridge.
 * @returns Store state and actions.
 */
export const createLinksState = () => {
  const entries = ref<readonly LinkEntry[]>([])
  const groups = ref<readonly string[]>([
    'organizations',
    'resources',
    'friendly',
  ])
  const fileSha = ref('')
  const loading = ref(false)
  const loaded = ref(false)

  return {
    entries,
    groups,
    fileSha,
    loading,
    loaded,
    loadLinks: createLoadLinks(entries, groups, fileSha, loading, loaded),
    updateLinks: createUpdateLinks(entries, groups, fileSha),
  }
}
