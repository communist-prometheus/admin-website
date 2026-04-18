import { ref } from 'vue'
import type { RolesConfig } from '@/types/role'
import { fetchRolesConfig, saveRolesConfig } from './roles-api'

const EMPTY: RolesConfig = {
  roles: { editor: [], 'chief-editor': [], admin: [] },
}

/**
 * Composable for loading and saving the roles config.
 * @returns Reactive roles state and save method
 */
export const useRolesConfig = () => {
  const config = ref<RolesConfig>(EMPTY)
  const loading = ref(false)
  const saving = ref(false)

  const load = async () => {
    loading.value = true
    try {
      config.value = await fetchRolesConfig()
    } finally {
      loading.value = false
    }
  }

  const save = async (updated: RolesConfig) => {
    saving.value = true
    try {
      await saveRolesConfig(updated)
      config.value = updated
    } finally {
      saving.value = false
    }
  }

  return { config, loading, saving, load, save }
}
