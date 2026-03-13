<script setup lang="ts">
import CoverOverlay from './CoverOverlay.vue'
import { COVER_IMAGE_ID } from './test-ids'

defineProps<{
  readonly coverUrl: string | undefined
}>()

defineEmits<{
  'delete-cover': []
  'upload-cover': [file: File]
}>()
</script>

<template>
  <figure
    :data-testid="COVER_IMAGE_ID"
    class="cover-image"
  >
    <img
      v-if="coverUrl"
      :src="coverUrl"
      alt="Article cover"
    />
    <p v-else class="no-cover">No cover image</p>
    <CoverOverlay
      @delete="$emit('delete-cover')"
      @upload="$emit('upload-cover', $event)"
    />
  </figure>
</template>

<style scoped>
.cover-image {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  margin: 0;
  max-height: 280px;
}

img {
  width: 100%;
  height: 280px;
  display: block;
  object-fit: cover;
}

.no-cover {
  padding: 2rem;
  text-align: center;
  color: var(--color-text-secondary);
  margin: 0;
}
</style>

<style>
.cover-image .cover-overlay {
  opacity: 0%;
  transition: opacity 0.2s;
}

.cover-image:hover .cover-overlay {
  opacity: 100%;
}
</style>
