<script setup lang="ts">
import { COVER_UPLOAD_ID } from './test-ids'
import UploadButton from './UploadButton.vue'

defineEmits<{
  upload: [file: File]
}>()
</script>

<template>
  <aside class="no-cover">
    <p class="no-cover-text">No cover image yet</p>
    <UploadButton
      label="Upload cover"
      accept="image/*,video/*"
      :test-id="COVER_UPLOAD_ID"
      @upload="$emit('upload', $event)"
    />
  </aside>
</template>

<style scoped>
.no-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  margin: 0;
  text-align: center;
  color: var(--color-text-secondary);
}

.no-cover-text {
  font-size: 0.8125rem;
  margin: 0;
}
</style>
