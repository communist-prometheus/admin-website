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
</script>

<template>
  <li
    :data-testid="ASSET_THUMB_ID"
    :data-status="status"
    :data-name="name"
    class="thumb"
    :class="{ deleted: status === 'pending-delete' }"
  >
    <img
      v-if="isImage() && thumbnailUrl"
      :src="thumbnailUrl"
      alt=""
      :aria-label="name"
    />
    <span class="name">{{ name }}</span>
    <span v-if="isCover" class="badge">cover</span>
    <AssetActions
      v-if="status !== 'pending-delete'"
      :show-cover="isImage() && !isCover"
      @set-cover="$emit('set-cover')"
      @delete="$emit('delete')"
    />
  </li>
</template>

<style scoped>
.thumb {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  text-align: center;
}

.thumb.deleted {
  opacity: 40%;
}

img {
  width: 100%;
  max-height: 80px;
  object-fit: contain;
  border-radius: 4px;
}

span {
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
  margin-left: 0.25rem;
}
</style>
