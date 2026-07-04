<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { visibleGroups } from '@/components/NavShared/visible-groups'
import { t } from '@/i18n/t'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'

const route = useRoute()
const roleStore = useRoleStore()
const auth = useAuthStore()

const groups = computed(() => visibleGroups(roleStore.role, auth.ssoRoles))

const labelFor = (item: {
  readonly label: string
  readonly labelKey?: string
}): string => (item.labelKey === undefined ? item.label : t(item.labelKey))
</script>

<template>
  <template v-for="group in groups" :key="group.title">
    <span class="nav-group-sep" aria-hidden="true" />
    <RouterLink
      v-for="item in group.items"
      :key="item.path"
      :to="item.path"
      :class="{ active: route.path.startsWith(item.path) }"
      :title="group.title"
    >
      {{ labelFor(item) }}
    </RouterLink>
  </template>
</template>

<style scoped>
.nav-group-sep {
  align-self: stretch;
  inline-size: 1px;
  margin-inline: 0.25rem;
  background: var(--color-border);
  opacity: 60%;
}

.nav-group-sep:first-child {
  display: none;
}
</style>
