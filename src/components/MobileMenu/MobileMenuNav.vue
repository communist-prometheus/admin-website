<script setup lang="ts">
import { computed } from 'vue'
import { visibleGroups } from '@/components/NavShared/visible-groups'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import MobileAuthAction from './MobileAuthAction.vue'
import MobileNavGroup from './MobileNavGroup.vue'
import MobileNavLink from './MobileNavLink.vue'

const emit = defineEmits<{
  navigate: []
}>()

const auth = useAuthStore()
const roleStore = useRoleStore()
/*
 * Groups appear only when the visitor is signed in — Home + Login are
 * the pre-auth surface. Once signed in, sectioned nav (Content /
 * Community / Distribution / Admin) replaces the flat list so items
 * are grouped by mental model, not order-of-implementation.
 */
const isAuth = computed(() => Boolean(auth.user))
const groups = computed(() =>
  isAuth.value ? visibleGroups(roleStore.role, auth.ssoRoles) : []
)
</script>

<template>
  <ul class="mobile-nav-list">
    <MobileNavLink path="/" label="Home" @click="emit('navigate')" />
    <MobileNavGroup
      v-for="group in groups"
      :key="group.title"
      :title="group.title"
      :items="group.items"
      @navigate="emit('navigate')"
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
