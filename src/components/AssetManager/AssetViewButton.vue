<script setup lang="ts">
import ViewIcon from '../FileViewer/icons/ViewIcon.vue'
import { ASSET_VIEW_ID } from './test-ids'

defineProps<{
  readonly name: string
}>()

defineEmits<{
  view: []
}>()
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :data-testid="ASSET_VIEW_ID"
    :aria-label="`Open ${name} in viewer`"
    @click="$emit('view')"
  >
    <ViewIcon />
  </button>
</template>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 28px;
  padding: 0.25rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.icon-btn:hover {
  background: var(--color-background-soft);
  color: var(--color-accent);
}

.icon-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
