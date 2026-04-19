<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { createDragHandlers } from './pdf-upload-handlers'

const props = defineProps<{
  readonly assets?: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  'upload-pdf': [file: File]
  'upload-cover': [file: File]
  'set-cover': [name: string]
}>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const pdfAsset = computed(() =>
  props.assets?.find(
    (a) => a.mimeType === 'application/pdf' && a.status !== 'pending-delete'
  )
)

const triggerUpload = () => { inputRef.value?.click() }

const handleFile = async (file: File) => {
  if (file.type !== 'application/pdf') return
  emit('upload-pdf', file)
  const m = await import('@/features/newspaper/extract-pdf-cover')
  const cover = await m.extractPdfCover(file)
  if (cover) { emit('upload-cover', cover); emit('set-cover', 'cover.png') }
}

const handleChange = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return
  const file = event.target.files?.[0]
  if (file) handleFile(file)
  event.target.value = ''
}

const { onDrop, onDragOver, onDragLeave } = createDragHandlers(dragging, handleFile)
</script>

<template>
  <article
    v-if="pdfAsset"
    class="pdf-current"
    data-testid="pdf-current"
  >
    <span class="pdf-icon" aria-hidden="true">PDF</span>
    <span class="pdf-name">{{ pdfAsset.name }}</span>
    <button type="button" class="pdf-replace" @click="triggerUpload">
      Replace PDF
    </button>
  </article>
  <button
    v-else
    type="button"
    class="pdf-dropzone"
    :class="{ dragging }"
    data-testid="pdf-dropzone"
    @click="triggerUpload"
    @drop.prevent="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
  >
    <span class="dropzone-icon" aria-hidden="true">PDF</span>
    <span class="dropzone-label">
      Drop PDF file here or click to upload
    </span>
  </button>
  <input
    ref="inputRef"
    type="file"
    accept="application/pdf"
    hidden
    @change="handleChange"
  />
</template>

<style scoped>
.pdf-current {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
}

.pdf-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--color-error, #e53935);
  color: #fff;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.pdf-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.pdf-replace {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.pdf-replace:hover {
  background: var(--color-background-mute);
}

.pdf-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.pdf-dropzone:hover,
.pdf-dropzone.dragging {
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
  background: var(--color-error, #e53935);
  color: #fff;
  font-weight: 700;
  font-size: 1.25rem;
}

.dropzone-label {
  color: var(--color-text-secondary);
  font-size: clamp(0.875rem, 2vw, 1rem);
}
</style>
