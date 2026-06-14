<script setup lang="ts">
import CloseIcon from './icons/CloseIcon.vue'
import { VIEWER_CLOSE_ID } from './test-ids'

defineEmits<{
  close: []
}>()
</script>

<template>
  <button
    type="button"
    class="viewer-icon-btn"
    :data-testid="VIEWER_CLOSE_ID"
    aria-label="Close viewer"
    @click="$emit('close')"
  >
    <CloseIcon />
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
