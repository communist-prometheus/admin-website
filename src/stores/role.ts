import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Role } from '@/types/role'
import { fetchRole } from './role-fetch'

/**
 * Pinia store for the current user's RBAC role.
 * @returns Reactive role state and load method
 */
export const useRoleStore = defineStore('role', () => {
  const role = ref<Role | undefined>()
  const loaded = ref(false)

  const loadRole = async () => {
    const result = await fetchRole()
    role.value = result
    loaded.value = true
  }

  return { role, loaded, loadRole }
})
