<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps<{
  readonly path: string
  readonly label: string
}>()

defineEmits<{ click: [] }>()

const route = useRoute()
</script>

<template>
  <RouterLink
    :to="props.path"
    :class="{ active: route.path === props.path }"
    class="mobile-nav-link"
    @click="$emit('click')"
  >
    {{ props.label }}
  </RouterLink>
</template>

<style scoped>
.mobile-nav-link {
  display: flex;
  align-items: center;
  min-height: 48px;
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 500;
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.mobile-nav-link:hover {
  background: var(--color-surface);
}

.active {
  color: var(--color-accent);
  background: var(--color-surface);
}
</style>
