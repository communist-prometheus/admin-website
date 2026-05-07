<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  readonly active: boolean
  readonly uploading: boolean
}>()

defineEmits<{
  click: []
  drop: [e: DragEvent]
  paste: [e: ClipboardEvent]
  'drag-over': [next: boolean]
}>()

const cls = computed(() => ({
  'drop-zone': true,
  active: props.active,
  uploading: props.uploading,
}))

const message = computed(() =>
  props.uploading
    ? 'Uploading…'
    : 'Drop image, paste from clipboard, or click to attach'
)
</script>

<template>
  <button
    type="button"
    :class="cls"
    aria-label="Drop files, paste a screenshot, or click to attach"
    @click="$emit('click')"
    @dragover.prevent="$emit('drag-over', true)"
    @dragleave.prevent="$emit('drag-over', false)"
    @drop.prevent="$emit('drop', $event)"
    @paste="$emit('paste', $event)"
  >
    {{ message }}
  </button>
</template>

<style scoped>
.drop-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 4rem;
  padding: 0.75rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  text-align: center;
  background: var(--color-background-soft);
  font-family: inherit;
  width: 100%;
}

.drop-zone:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.drop-zone.active {
  border-color: var(--color-accent);
  background: var(--color-background);
}

.drop-zone.uploading {
  opacity: 70%;
  cursor: progress;
}
</style>
