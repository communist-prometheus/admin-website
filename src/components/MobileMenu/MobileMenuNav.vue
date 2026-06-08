<script setup lang="ts">
import { computed } from 'vue'
import { t } from '@/i18n/t'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import MobileAuthAction from './MobileAuthAction.vue'
import MobileNavLink from './MobileNavLink.vue'
import type { NavItem } from './nav-items'
import { visibleItems } from './visible-items'

const emit = defineEmits<{
  navigate: []
}>()

const auth = useAuthStore()
const roleStore = useRoleStore()
const items = computed(() =>
  visibleItems(!!auth.user, roleStore.role, auth.ssoRoles)
)
const labelFor = (item: NavItem): string =>
  item.labelKey === undefined ? item.label : t(item.labelKey)
</script>

<template>
  <ul class="mobile-nav-list">
    <MobileNavLink
      v-for="item in items"
      :key="item.path"
      :path="item.path"
      :label="labelFor(item)"
      @click="emit('navigate')"
    />
    <MobileAuthAction @navigate="emit('navigate')" />
  </ul>
</template>

<style scoped>
.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
