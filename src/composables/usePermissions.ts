import { computed } from 'vue'
import { useRoleStore } from '@/stores/role'
import type { ContentType } from '@/types/content'
import type { Role } from '@/types/role'

const atLeast = (role: Role | undefined, min: Role): boolean => {
  if (!role) return false
  const order: Record<Role, number> = {
    editor: 0,
    'chief-editor': 1,
    admin: 2,
  }
  return order[role] >= order[min]
}

const ADMIN_ONLY: ReadonlySet<ContentType> = new Set(['pages', 'common'])
const CHIEF_PLUS: ReadonlySet<ContentType> = new Set(['positions'])

/**
 * Composable providing permission checks based on user role.
 * @returns Reactive permission helpers
 */
export const usePermissions = () => {
  const store = useRoleStore()
  const role = computed(() => store.role)

  const canCreate = (type: ContentType) => {
    if (ADMIN_ONLY.has(type)) return atLeast(role.value, 'admin')
    if (CHIEF_PLUS.has(type)) return atLeast(role.value, 'chief-editor')
    return !!role.value
  }

  const canEditSettings = computed(() => atLeast(role.value, 'admin'))

  return { role, canCreate, canEditSettings }
}
