<script setup lang="ts">
import AssetDownloadButton from './AssetDownloadButton.vue'
import AssetViewButton from './AssetViewButton.vue'
import { ASSET_COVER_ID, ASSET_DELETE_ID } from './test-ids'

defineProps<{
  readonly showCover: boolean
  readonly showView: boolean
  readonly name: string
}>()

defineEmits<{
  'set-cover': []
  delete: []
  download: []
  view: []
}>()
</script>

<template>
  <menu class="actions">
    <AssetViewButton
      v-if="showView"
      :name="name"
      @view="$emit('view')"
    />
    <AssetDownloadButton :name="name" @download="$emit('download')" />
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
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  list-style: none;
  padding: 0;
  margin: 0.375rem 0 0;
}

button {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
}

button:hover {
  background: var(--color-background-soft);
}

button:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
