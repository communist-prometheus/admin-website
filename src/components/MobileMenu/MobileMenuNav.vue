<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { visibleGroups } from '@/components/NavShared/visible-groups'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import MobileAuthAction from './MobileAuthAction.vue'
import MobileGroupRow from './MobileGroupRow.vue'
import MobileNavLink from './MobileNavLink.vue'
import MobileSubmenu from './MobileSubmenu.vue'

const emit = defineEmits<{
  navigate: []
}>()

const auth = useAuthStore()
const roleStore = useRoleStore()
const route = useRoute()

const isAuth = computed(() => Boolean(auth.user))
const groups = computed(() =>
  isAuth.value ? visibleGroups(roleStore.role, auth.ssoRoles) : []
)

/*
 * Drilldown state. `openTitle === undefined` = root panel (list of
 * group rows). Anything else = the submenu for that group's title.
 * Only one panel is mounted at a time, so the drawer height never
 * changes and nothing "jumps" beneath the tapped row.
 */
const openTitle = ref<string | undefined>(undefined)

const openGroup = computed(() =>
  groups.value.find(g => g.title === openTitle.value)
)

const activeGroupTitle = computed(
  () =>
    groups.value.find(g =>
      g.items.some(item => route.path.startsWith(item.path))
    )?.title
)

/*
 * Auto-drill into the active section when route changes — landing on
 * /content/blog opens the Content submenu. Manual navigation via
 * MobileGroupRow's `@enter` sets `openTitle` directly; the back button
 * clears it to undefined.
 */
watch(activeGroupTitle, next => {
  if (next !== undefined) openTitle.value = next
})
/* Auto-drill on first mount if we already have an active section. */
if (activeGroupTitle.value !== undefined)
  openTitle.value = activeGroupTitle.value

const enter = (title: string): void => {
  openTitle.value = title
}

const back = (): void => {
  openTitle.value = undefined
}

const onNavigate = (): void => {
  emit('navigate')
}
</script>

<template>
  <MobileSubmenu
    v-if="openGroup"
    :title="openGroup.title"
    :items="openGroup.items"
    @back="back"
    @navigate="onNavigate"
  />
  <div v-else class="mobile-nav-root" role="list">
    <MobileNavLink path="/" label="Home" @click="onNavigate" />
    <MobileGroupRow
      v-for="group in groups"
      :key="group.title"
      :title="group.title"
      :active="activeGroupTitle === group.title"
      @enter="enter(group.title)"
    />
    <MobileAuthAction @navigate="onNavigate" />
  </div>
</template>

<style scoped>
.mobile-nav-root {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
