<script setup lang="ts">
import { ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { MEDIA_PICKER_ID } from '../test-ids'
import MediaDropdown from './MediaDropdown.vue'

defineProps<{
  readonly assets: readonly AssetDisplay[]
}>()

defineEmits<{
  select: [asset: AssetDisplay]
  upload: [file: File]
}>()

const open = ref(false)
let closeTimer: ReturnType<typeof setTimeout> | undefined

const toggle = () => {
  open.value = !open.value
}
const close = () => {
  open.value = false
}
const scheduleClose = () => {
  closeTimer = setTimeout(close, 300)
}
const cancelClose = () => {
  clearTimeout(closeTimer)
}
</script>

<template>
  <span
    class="media-picker"
    :data-testid="MEDIA_PICKER_ID"
    @mouseenter="cancelClose"
    @mouseleave="scheduleClose"
  >
    <button
      type="button"
      class="trigger"
      title="Insert media"
      aria-label="Insert media"
      @click="toggle"
    >
      📎
    </button>
    <MediaDropdown
      v-if="open"
      :assets="assets"
      @select="a => { $emit('select', a); close() }"
      @upload="f => { $emit('upload', f); close() }"
    />
  </span>
</template>

<style scoped>
.media-picker {
  position: relative;
}

.trigger {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
}

.trigger:hover {
  background: var(--color-background);
}
</style>
