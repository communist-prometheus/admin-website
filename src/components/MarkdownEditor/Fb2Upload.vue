<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { createDragHandlers } from './pdf-upload-handlers'

const props = defineProps<{
  readonly assets?: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  'upload-fb2': [file: File]
  error: [message: string]
}>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const fb2Asset = computed(() =>
  props.assets?.find(
    a => a.name.toLowerCase().endsWith('.fb2') && a.status !== 'pending-delete'
  )
)

const triggerUpload = () => {
  inputRef.value?.click()
}

/*
 * Direct FB2 upload — the editor already has the FB2 produced
 * elsewhere (Calibre, scribus → fb2, hand-written, etc.) and just
 * wants it shipped. Validates by extension since browsers don't
 * agree on a MIME for application/x-fictionbook+xml.
 */
const handleFile = (file: File): void => {
  if (!file.name.toLowerCase().endsWith('.fb2')) {
    emit('error', 'Only .fb2 files are accepted here')
    return
  }
  const renamed = new File([file], 'gazette.fb2', {
    type: file.type || 'application/x-fictionbook+xml',
  })
  emit('upload-fb2', renamed)
}

const handleChange = (event: Event): void => {
  if (!(event.target instanceof HTMLInputElement)) return
  const file = event.target.files?.[0]
  if (file) handleFile(file)
  event.target.value = ''
}

const { onDrop, onDragOver, onDragLeave } = createDragHandlers(
  dragging,
  handleFile
)
</script>

<template>
  <article
    v-if="fb2Asset"
    class="fb2-current"
    data-testid="fb2-current"
  >
    <span class="fb2-icon" aria-hidden="true">FB2</span>
    <span class="fb2-name">{{ fb2Asset.name }}</span>
    <button
      type="button"
      class="fb2-replace"
      @click="triggerUpload"
    >
      Replace FB2
    </button>
  </article>
  <button
    v-else
    type="button"
    class="fb2-dropzone"
    :class="{ dragging }"
    data-testid="fb2-dropzone"
    @click="triggerUpload"
    @drop.prevent="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
  >
    <span class="dropzone-icon" aria-hidden="true">FB2</span>
    <span class="dropzone-label">Drop a .fb2 file directly</span>
  </button>
  <input
    ref="inputRef"
    type="file"
    accept=".fb2"
    hidden
    @change="handleChange"
  />
</template>

<style scoped>
.fb2-current {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
}

.fb2-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--color-success, #2e7d32);
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.fb2-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.fb2-replace {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.fb2-replace:hover {
  background: var(--color-background-mute);
}

.fb2-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1.5rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.fb2-dropzone:hover,
.fb2-dropzone.dragging {
  border-color: var(--color-accent);
  background: var(--color-background-mute);
}

.dropzone-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  background: var(--color-success, #2e7d32);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
}

.dropzone-label {
  color: var(--color-text-secondary);
  font-size: clamp(0.875rem, 2vw, 1rem);
  text-align: center;
}
</style>
