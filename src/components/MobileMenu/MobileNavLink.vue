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

  /*
   * Compact rows so the drawer fits on a single mobile screen even
   * with several groups expanded. 40px is Apple's minimum touch
   * target height once a leading padding-inline is added.
   */
  min-height: 40px;
  padding: 0.35rem 1rem 0.35rem 1.6rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-primary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);

  /*
   * Never break a label per character. Under a narrow drawer the
   * default `overflow-wrap: normal` still wraps at whitespace, but
   * "Newsletter" has none — so the browser was character-wrapping it
   * and every letter landed on its own line, indistinguishable from
   * a 90° rotation. `white-space: nowrap` keeps the label on one line
   * and `text-overflow: ellipsis` truncates if it's still too wide.
   */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-nav-link:hover {
  background: var(--color-surface);
}

.active {
  color: var(--color-accent);
  background: var(--color-surface);
}
</style>
