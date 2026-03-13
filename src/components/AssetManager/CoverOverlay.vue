<script setup lang="ts">
import {
  COVER_DELETE_ID,
  COVER_OVERLAY_ID,
  COVER_UPLOAD_ID,
} from './test-ids'
import UploadButton from './UploadButton.vue'

defineEmits<{
  delete: []
  upload: [file: File]
}>()
</script>

<template>
  <aside :data-testid="COVER_OVERLAY_ID" class="cover-overlay">
    <button
      type="button"
      :data-testid="COVER_DELETE_ID"
      class="overlay-btn"
      @click="$emit('delete')"
    >
      Delete cover
    </button>
    <UploadButton
      :label="'Upload new cover'"
      accept="image/*"
      :test-id="COVER_UPLOAD_ID"
      @upload="$emit('upload', $event)"
    />
  </aside>
</template>

<style scoped>
.cover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgb(0 0 0 / 50%);
  opacity: 0%;
  transition: opacity 0.2s;
}

.overlay-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #fff;
  border-radius: var(--radius-md);
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
}

.overlay-btn:hover {
  background: rgb(255 255 255 / 20%);
}
</style>

<style>
.cover-overlay button {
  padding: 0.5rem 1rem;
  border: 1px solid #fff;
  border-radius: var(--radius-md);
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
}

.cover-overlay button:hover {
  background: rgb(255 255 255 / 20%);
}
</style>
