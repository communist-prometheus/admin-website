<script setup lang="ts">
import DownloadIcon from '../AssetManager/DownloadIcon.vue'
import { VIEWER_DOWNLOAD_ID } from './test-ids'

defineProps<{
  readonly name: string
}>()

defineEmits<{
  download: []
}>()
</script>

<template>
  <button
    type="button"
    class="download-btn"
    :data-testid="VIEWER_DOWNLOAD_ID"
    :aria-label="`Download ${name}`"
    @click="$emit('download')"
  >
    <DownloadIcon />
    <span>Download</span>
  </button>
</template>

<style scoped>
.download-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
}

.download-btn:hover {
  background: var(--color-accent-hover);
}

.download-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
</style>
