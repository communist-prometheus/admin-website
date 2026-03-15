<script setup lang="ts">
import { ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import MediaItem from './MediaItem.vue'

defineProps<{
  readonly assets: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  select: [asset: AssetDisplay]
  upload: [file: File]
}>()

const inputRef = ref<HTMLInputElement>()

const onFile = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const file = event.target.files?.[0]
  if (file) emit('upload', file)
  event.target.value = ''
}

const active = (a: AssetDisplay) =>
  a.status !== 'pending-delete'
</script>

<template>
  <menu class="dropdown" role="listbox">
    <button
      type="button"
      class="upload-btn"
      @click="inputRef?.click()"
    >
      Upload...
    </button>
    <input
      ref="inputRef"
      type="file"
      accept="*/*"
      hidden
      @change="onFile"
    />
    <MediaItem
      v-for="a in assets.filter(active)"
      :key="a.name"
      :name="a.name"
      :thumbnail-url="a.thumbnailUrl"
      :mime-type="a.mimeType"
      @pick="emit('select', a)"
    />
  </menu>
</template>

<style scoped>
.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  min-width: 200px;
  max-height: 260px;
  overflow-y: auto;
  margin: 0.25rem 0 0;
  padding: 0.25rem;
  list-style: none;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.upload-btn {
  width: 100%;
  padding: 0.375rem 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  text-align: start;
}

.upload-btn:hover {
  background: var(--color-background-soft);
  color: var(--color-text);
}
</style>
