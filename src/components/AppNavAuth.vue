<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { t } from '@/i18n/t'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import { getNavForRole } from './ContentNav/nav-by-role'

const route = useRoute()
const roleStore = useRoleStore()
const auth = useAuthStore()
const items = computed(() => getNavForRole(roleStore.role, auth.ssoRoles))
const labelFor = (item: { label: string; labelKey?: string }): string =>
  item.labelKey === undefined ? item.label : t(item.labelKey)
</script>

<template>
  <RouterLink
    v-for="item in items"
    :key="item.path"
    :to="item.path"
    :class="{ active: route.path.startsWith(item.path) }"
  >
    {{ labelFor(item) }}
  </RouterLink>
</template>
