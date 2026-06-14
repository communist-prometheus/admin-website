<script setup lang="ts">
import FullscreenExitIcon from './icons/FullscreenExitIcon.vue'
import FullscreenIcon from './icons/FullscreenIcon.vue'
import { VIEWER_FULLSCREEN_ID } from './test-ids'

defineProps<{
  readonly active: boolean
}>()

defineEmits<{
  toggle: []
}>()
</script>

<template>
  <button
    type="button"
    class="viewer-icon-btn"
    :data-testid="VIEWER_FULLSCREEN_ID"
    :aria-label="active ? 'Exit fullscreen' : 'Enter fullscreen'"
    :aria-pressed="active"
    @click="$emit('toggle')"
  >
    <FullscreenExitIcon v-if="active" />
    <FullscreenIcon v-else />
  </button>
</template>

<style scoped>
.viewer-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  background: rgb(0 0 0 / 35%);
  color: #fff;
  cursor: pointer;
}

.viewer-icon-btn:hover {
  background: rgb(0 0 0 / 55%);
}

.viewer-icon-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}
</style>
