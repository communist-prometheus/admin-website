<script setup lang="ts">
import CoverEmpty from './CoverEmpty.vue'
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
    <CoverEmpty v-else @upload="$emit('upload-cover', $event)" />
    <CoverOverlay
      v-if="coverUrl"
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
  margin: 0 auto;
  max-width: 32rem;
  width: 100%;
  background: var(--color-background-soft);
}

img {
  width: 100%;
  max-height: 16rem;
  display: block;
  object-fit: contain;
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

@media (hover: none) {
  .cover-image .cover-overlay {
    opacity: 100%;
  }
}
</style>
