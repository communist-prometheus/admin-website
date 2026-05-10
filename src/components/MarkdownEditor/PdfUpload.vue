<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { runPdfUpload } from './pdf-upload-flow'
import { createDragHandlers } from './pdf-upload-handlers'
import { matchesSource } from './source-asset-naming'

const props = defineProps<{
  readonly assets?: readonly AssetDisplay[]
  readonly currentCover?: string
  readonly slug: string
  readonly lang: string
}>()

const emit = defineEmits<{
  'upload-pdf': [file: File]
  'upload-cover': [file: File]
  'set-cover': [name: string]
  error: [message: string]
}>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const pdfAsset = computed(() =>
  props.assets?.find(
    a =>
      a.mimeType === 'application/pdf' &&
      matchesSource(a, props.slug, props.lang, 'pdf')
  )
)

const triggerUpload = () => {
  inputRef.value?.click()
}

const flowEmits = {
  uploadPdf: (f: File) => emit('upload-pdf', f),
  uploadCover: (f: File) => emit('upload-cover', f),
  setCover: (n: string) => emit('set-cover', n),
  error: (m: string) => emit('error', m),
}

const handleFile = (file: File) =>
  runPdfUpload(file, { ...props, emits: flowEmits })

const handleChange = (event: Event) => {
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
    <span class="dropzone-label">Drop PDF here or click to upload</span>
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
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  cursor: pointer;
  text-align: left;
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
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--color-error, #e53935);
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.dropzone-label {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  line-height: 1.3;
}
</style>
