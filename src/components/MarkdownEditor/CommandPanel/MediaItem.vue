<script setup lang="ts">
import { MEDIA_ITEM_ID } from '../test-ids'

const props = defineProps<{
  readonly name: string
  readonly thumbnailUrl: string
  readonly mimeType: string
}>()

defineEmits<{ pick: [] }>()

const isImage = () => props.mimeType.startsWith('image/')

const typeIcon = () => {
  if (props.mimeType.startsWith('video/')) return '\u25B6'
  if (props.mimeType.startsWith('audio/')) return '\u266B'
  return '\u25CB'
}
</script>

<template>
  <button
    type="button"
    :data-testid="MEDIA_ITEM_ID"
    class="item"
    role="option"
    @click="$emit('pick')"
  >
    <img
      v-if="thumbnailUrl && isImage()"
      :src="thumbnailUrl"
      alt=""
      class="thumb"
    />
    <span v-else class="icon" aria-hidden="true">
      {{ typeIcon() }}
    </span>
    <span class="name">{{ name }}</span>
  </button>
</template>

<style scoped>
.item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  cursor: pointer;
  text-align: start;
}

.item:hover {
  background: var(--color-background-soft);
}

.thumb {
  width: 24px;
  height: 24px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.name {
  font-size: 0.8rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
