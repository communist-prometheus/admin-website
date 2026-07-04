<script setup lang="ts">
import type { NavEntry } from '@/components/NavShared/nav-groups'
import { t } from '@/i18n/t'
import MobileNavLink from './MobileNavLink.vue'

defineProps<{
  readonly title: string
  readonly items: readonly NavEntry[]
}>()

defineEmits<{ navigate: [] }>()

const labelFor = (item: NavEntry): string =>
  item.labelKey === undefined ? item.label : t(item.labelKey)
</script>

<template>
  <li class="mobile-nav-group">
    <!--
      role=heading + aria-level keeps the accessibility semantics but
      avoids matching global `page.locator('h3').first()` selectors used
      in the content list tests (the first h3 in the DOM would otherwise
      be this heading — always mounted, invisible when the menu is
      closed via opacity: 0 on the overlay).
    -->
    <span
      class="mobile-nav-heading"
      role="heading"
      aria-level="3"
    >
      {{ title }}
    </span>
    <MobileNavLink
      v-for="item in items"
      :key="item.path"
      :path="item.path"
      :label="labelFor(item)"
      @click="$emit('navigate')"
    />
  </li>
</template>

<style scoped>
.mobile-nav-group {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs, 0.15rem);
  padding-block: var(--spacing-xs);
}

.mobile-nav-group + .mobile-nav-group {
  border-block-start: 1px solid var(--color-border);
}

.mobile-nav-heading {
  display: block;
  margin: 0 0 0.25rem;
  padding-inline: var(--spacing-sm);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
</style>
