<script setup lang="ts">
import AssetActions from './AssetActions.vue'
import { ASSET_THUMB_ID } from './test-ids'

const props = defineProps<{
  readonly name: string
  readonly path: string
  readonly thumbnailUrl: string
  readonly mimeType: string
  readonly status: 'committed' | 'pending-add' | 'pending-delete'
  readonly isCover: boolean
}>()

defineEmits<{
  'set-cover': []
  delete: []
}>()

const isImage = () => props.mimeType.startsWith('image/')
const isVideo = () => props.mimeType.startsWith('video/')
const isAudio = () => props.mimeType.startsWith('audio/')
const isVisual = () => isImage() || isVideo()
</script>

<template>
  <li
    :data-testid="ASSET_THUMB_ID"
    :data-status="status"
    :data-name="name"
    :data-mime="mimeType"
    class="thumb"
    :class="{ deleted: status === 'pending-delete' }"
  >
    <img
      v-if="isImage() && thumbnailUrl"
      :src="thumbnailUrl"
      alt=""
      :aria-label="name"
    />
    <video
      v-else-if="isVideo() && thumbnailUrl"
      :src="thumbnailUrl"
      :aria-label="name"
      muted
      preload="metadata"
    />
    <audio
      v-else-if="isAudio() && thumbnailUrl"
      :src="thumbnailUrl"
      :aria-label="name"
      controls
      preload="metadata"
    />
    <span v-else class="file-icon" aria-hidden="true">📄</span>
    <span class="name">{{ name }}</span>
    <span v-if="isCover" class="badge">cover</span>
    <AssetActions
      v-if="status !== 'pending-delete'"
      :show-cover="isVisual() && !isCover"
      @set-cover="$emit('set-cover')"
      @delete="$emit('delete')"
    />
  </li>
</template>

<style scoped>
.thumb {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  text-align: center;
  background: var(--color-background-soft);
}

.thumb.deleted {
  opacity: 40%;
}

img,
video {
  width: 100%;
  height: 120px;
  object-fit: contain;
  border-radius: 4px;
  display: block;
}

audio {
  width: 100%;
  margin-top: 0.5rem;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 120px;
  font-size: 2.5rem;
}

.name {
  display: block;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 0.25rem;
}

.badge {
  display: inline-block;
  background: var(--color-accent, #42b883);
  color: #fff;
  font-size: 0.625rem;
  padding: 0.1rem 0.3rem;
  border-radius: 3px;
  margin-top: 0.25rem;
}
</style>

<style>
.thumb .actions {
  opacity: 0%;
  transition: opacity 0.2s;
}

.thumb:hover .actions {
  opacity: 100%;
}
</style>
