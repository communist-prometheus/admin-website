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
   * Wrap at word boundaries — never at character. The root cause of
   * the vertical-text bug was a rotated ancestor forcing 40 px width
   * on links; a plain `nowrap + ellipsis` would fix that but silently
   * truncate longer i18n labels ("Управление рассылками") without any
   * visible clue that content was cut. The drawer now has 288 px of
   * inline space, so `overflow-wrap: anywhere` is safe: legible words
   * stay on one line, rare very-long ones wrap to two — visible.
   */
  overflow-wrap: anywhere;
  word-break: normal;
}

.mobile-nav-link:hover {
  background: var(--color-surface);
}

.active {
  color: var(--color-accent);
  background: var(--color-surface);
}
</style>
