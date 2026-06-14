<script setup lang="ts">
import CloseButton from './CloseButton.vue'
import FullscreenButton from './FullscreenButton.vue'

defineProps<{
  readonly position: string
  readonly fullscreen: boolean
}>()

defineEmits<{
  close: []
  'toggle-fullscreen': []
}>()
</script>

<template>
  <div class="toolbar">
    <span class="position">{{ position }}</span>
    <FullscreenButton
      :active="fullscreen"
      @toggle="$emit('toggle-fullscreen')"
    />
    <CloseButton @close="$emit('close')" />
  </div>
</template>

<style scoped>
.toolbar {
  position: absolute;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: clamp(0.5rem, 2vw, 1rem);
}

.position {
  margin-inline-end: auto;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius-sm);
  background: rgb(0 0 0 / 35%);
  color: #fff;
  font-size: 0.8125rem;
  font-variant-numeric: tabular-nums;
}
</style>
