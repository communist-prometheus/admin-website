<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { visibleGroups } from '@/components/NavShared/visible-groups'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import MobileAuthAction from './MobileAuthAction.vue'
import MobileGroupRow from './MobileGroupRow.vue'
import MobileNavLink from './MobileNavLink.vue'

const emit = defineEmits<{
  navigate: []
  'open-submenu': [payload: { title: string; anchor: DOMRect }]
  'close-submenu': []
}>()

const auth = useAuthStore()
const roleStore = useRoleStore()
const route = useRoute()
const activeSubmenu = ref<string | undefined>(undefined)

const isAuth = computed(() => Boolean(auth.user))
const groups = computed(() =>
  isAuth.value ? visibleGroups(roleStore.role, auth.ssoRoles) : []
)

const activeGroupTitle = computed(
  () =>
    groups.value.find(g =>
      g.items.some(item => route.path.startsWith(item.path))
    )?.title
)

const onEnter = (title: string, evt: MouseEvent): void => {
  const rowEl = evt.currentTarget as HTMLElement | undefined
  const anchor = rowEl?.getBoundingClientRect()
  if (!anchor) return
  /* Toggle: tapping the currently-open group closes its submenu. */
  const same = activeSubmenu.value === title
  activeSubmenu.value = same ? undefined : title
  if (same) emit('close-submenu')
  else emit('open-submenu', { title, anchor })
}

const onNavigate = (): void => {
  activeSubmenu.value = undefined
  emit('navigate')
}
</script>

<template>
  <div class="mobile-nav-list" role="list">
    <MobileNavLink path="/" label="Home" @click="onNavigate" />
    <MobileGroupRow
      v-for="group in groups"
      :key="group.title"
      :title="group.title"
      :active="activeGroupTitle === group.title || activeSubmenu === group.title"
      @enter="onEnter(group.title, $event)"
    />
    <MobileAuthAction @navigate="onNavigate" />
  </div>
</template>

<style scoped>
.mobile-nav-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
