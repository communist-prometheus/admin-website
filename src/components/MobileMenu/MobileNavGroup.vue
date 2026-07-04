<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { NavEntry } from '@/components/NavShared/nav-groups'
import { t } from '@/i18n/t'
import MobileNavGroupSummary from './MobileNavGroupSummary.vue'
import MobileNavLink from './MobileNavLink.vue'

const props = defineProps<{
  readonly title: string
  readonly items: readonly NavEntry[]
}>()

defineEmits<{ navigate: [] }>()

const route = useRoute()

/*
 * Auto-expand the group whose active item lives inside — otherwise
 * every group starts collapsed so the drawer stays a single-screen
 * list of category headers. Tapping any other header opens it and
 * lets the default <details> behaviour handle the rest.
 */
const isActiveGroup = computed(() =>
  props.items.some(item => route.path.startsWith(item.path))
)

/*
 * Track the details' actual open state so the chevron glyph stays in
 * sync with user interaction (native `<details>` toggling is outside
 * Vue's control). A `toggle` event listener bounces the state back.
 */
const openState = ref(isActiveGroup.value)
watch(isActiveGroup, next => {
  openState.value = next
})
const onToggle = (e: Event): void => {
  openState.value = (e.target as HTMLDetailsElement).open
}

const labelFor = (item: NavEntry): string =>
  item.labelKey === undefined ? item.label : t(item.labelKey)
</script>

<template>
  <details
    class="mobile-nav-details"
    :open="openState"
    :data-testid="`mobile-nav-group-${title.toLowerCase()}`"
    @toggle="onToggle"
  >
    <MobileNavGroupSummary :title="title" :open="openState" />
    <MobileNavLink
      v-for="item in items"
      :key="item.path"
      :path="item.path"
      :label="labelFor(item)"
      @click="$emit('navigate')"
    />
  </details>
</template>

<style scoped>
.mobile-nav-details {
  display: block;
}

.mobile-nav-details + .mobile-nav-details {
  border-block-start: 1px solid var(--color-border);
}
</style>
