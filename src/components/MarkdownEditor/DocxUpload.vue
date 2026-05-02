<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { createDragHandlers } from './pdf-upload-handlers'

const props = defineProps<{
  readonly assets?: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  'upload-docx': [file: File]
}>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const docxAsset = computed(() =>
  props.assets?.find(
    a => a.mimeType === DOCX_MIME && a.status !== 'pending-delete'
  )
)

const triggerUpload = () => {
  inputRef.value?.click()
}

/*
 * Newspaper issues can ship a .docx alongside the PDF; the public
 * site's build integration converts it to FB2 for offline e-readers
 * (public-website#72). The MIME check is the OOXML wordprocessingml
 * variant — old binary .doc is rejected so we don't break the FB2
 * pipeline that expects mammoth-readable input.
 */
const handleFile = (file: File): void => {
  if (file.type !== DOCX_MIME) return
  emit('upload-docx', file)
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
    v-if="docxAsset"
    class="docx-current"
    data-testid="docx-current"
  >
    <span class="docx-icon" aria-hidden="true">DOCX</span>
    <span class="docx-name">{{ docxAsset.name }}</span>
    <button
      type="button"
      class="docx-replace"
      @click="triggerUpload"
    >
      Replace DOCX
    </button>
  </article>
  <button
    v-else
    type="button"
    class="docx-dropzone"
    :class="{ dragging }"
    data-testid="docx-dropzone"
    @click="triggerUpload"
    @drop.prevent="onDrop"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
  >
    <span class="dropzone-icon" aria-hidden="true">DOCX</span>
    <span class="dropzone-label">
      Drop a .docx file here or click to upload (auto-converts to FB2 on the
      public site)
    </span>
  </button>
  <input
    ref="inputRef"
    type="file"
    :accept="DOCX_MIME"
    hidden
    @change="handleChange"
  />
</template>

<style scoped>
.docx-current {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
}

.docx-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  background: var(--color-info, #1976d2);
  color: #fff;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.docx-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.docx-replace {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.docx-replace:hover {
  background: var(--color-background-mute);
}

.docx-dropzone {
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

.docx-dropzone:hover,
.docx-dropzone.dragging {
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
  background: var(--color-info, #1976d2);
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
