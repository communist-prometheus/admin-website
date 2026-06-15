<script setup lang="ts">
import ChevronLeftIcon from './icons/ChevronLeftIcon.vue'
import ChevronRightIcon from './icons/ChevronRightIcon.vue'
import { VIEWER_NEXT_ID, VIEWER_PREV_ID } from './test-ids'

const props = defineProps<{
  readonly direction: 'prev' | 'next'
  readonly disabled: boolean
}>()

defineEmits<{
  move: []
}>()

const isPrev = props.direction === 'prev'
</script>

<template>
  <button
    type="button"
    class="nav-btn"
    :class="direction"
    :data-testid="isPrev ? VIEWER_PREV_ID : VIEWER_NEXT_ID"
    :aria-label="isPrev ? 'Previous file' : 'Next file'"
    :disabled="disabled"
    @click="$emit('move')"
  >
    <ChevronLeftIcon v-if="isPrev" />
    <ChevronRightIcon v-else />
  </button>
</template>

<style scoped>
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  background: rgb(0 0 0 / 35%);
  color: #fff;
  cursor: pointer;
}

.nav-btn.prev {
  inset-inline-start: clamp(0.5rem, 2vw, 1.5rem);
}

.nav-btn.next {
  inset-inline-end: clamp(0.5rem, 2vw, 1.5rem);
}

.nav-btn:disabled {
  opacity: 35%;
  cursor: default;
}

.nav-btn:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.nav-btn:hover:not(:disabled) {
  background: rgb(0 0 0 / 55%);
}
</style>
