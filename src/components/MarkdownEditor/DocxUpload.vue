<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { buildDocxMeta } from './docx-meta'
import { docxFileToFb2 } from './docx-to-fb2'
import { createDragHandlers } from './pdf-upload-handlers'
import { matchesSource, sourceName } from './source-asset-naming'

const props = defineProps<{
  readonly assets?: readonly AssetDisplay[]
  readonly slug: string
  readonly lang: string
  readonly issueTitle?: string
  readonly issueLang?: string
  readonly issueDescription?: string
}>()

const emit = defineEmits<{
  'upload-fb2': [file: File]
  error: [message: string]
}>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const fb2Asset = computed(() =>
  props.assets?.find(a => matchesSource(a, props.slug, props.lang, 'fb2'))
)

const triggerUpload = () => {
  inputRef.value?.click()
}

const handleFile = async (file: File): Promise<void> => {
  if (file.type !== DOCX_MIME) {
    emit('error', 'Only .docx files (Office Open XML) are accepted here')
    return
  }
  const fb2 = await docxFileToFb2(file, buildDocxMeta(props))
  emit('upload-fb2', new File([fb2], sourceName(props.slug, props.lang, 'fb2'), {
    type: fb2.type || 'application/x-fictionbook+xml',
  }))
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
    class="docx-current"
    data-testid="docx-current"
  >
    <span class="docx-icon" aria-hidden="true">FB2</span>
    <span class="docx-name">FB2 ready ({{ fb2Asset.name }})</span>
    <button
      type="button"
      class="docx-replace"
      @click="triggerUpload"
    >
      Re-import from DOCX
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
      Drop a .docx — auto-converts to FB2 (only the FB2 ships)
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

.docx-dropzone:hover,
.docx-dropzone.dragging {
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
  background: var(--color-info, #1976d2);
  color: #fff;
  font-weight: 700;
  font-size: 0.6875rem;
  flex-shrink: 0;
}

.dropzone-label {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  line-height: 1.3;
}
</style>
