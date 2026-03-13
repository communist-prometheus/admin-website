<script setup lang="ts">
import { ASSET_COVER_ID, ASSET_DELETE_ID } from './test-ids'

defineProps<{
  readonly showCover: boolean
}>()

defineEmits<{
  'set-cover': []
  delete: []
}>()
</script>

<template>
  <menu class="actions">
    <button
      v-if="showCover"
      type="button"
      :data-testid="ASSET_COVER_ID"
      @click="$emit('set-cover')"
    >
      Set as cover
    </button>
    <button
      type="button"
      :data-testid="ASSET_DELETE_ID"
      @click="$emit('delete')"
    >
      Delete
    </button>
  </menu>
</template>

<style scoped>
.actions {
  display: flex;
  gap: 0.25rem;
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
}

button {
  font-size: 0.7rem;
  padding: 0.2rem 0.4rem;
  border: 1px solid var(--color-border);
  border-radius: 3px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

button:hover {
  background: var(--color-background-soft);
}
</style>
