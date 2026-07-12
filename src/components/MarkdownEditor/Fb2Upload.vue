<script setup lang="ts">
import { computed, ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import { sanitizeFb2 } from '@/features/magazine/sanitize-fb2'
import { createDragHandlers } from './pdf-upload-handlers'
import { readFb2Text } from './read-fb2-text'
import { matchesSource, sourceName } from './source-asset-naming'

const props = defineProps<{
  readonly assets?: readonly AssetDisplay[]
  readonly slug: string
  readonly lang: string
}>()

const emit = defineEmits<{
  'upload-fb2': [file: File]
  error: [message: string]
}>()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)

const fb2Asset = computed(() =>
  props.assets?.find(a => matchesSource(a, props.slug, props.lang, 'fb2'))
)

const triggerUpload = () => {
  inputRef.value?.click()
}

const handleFile = async (file: File): Promise<void> => {
  if (!file.name.toLowerCase().endsWith('.fb2')) {
    emit('error', 'Only .fb2 files are accepted here')
    return
  }
  const cleaned = sanitizeFb2(await readFb2Text(file))
  emit(
    'upload-fb2',
    new File([cleaned], sourceName(props.slug, props.lang, 'fb2'), {
      type: 'application/x-fictionbook+xml',
    })
  )
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

.fb2-dropzone:hover,
.fb2-dropzone.dragging {
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
  background: var(--color-success, #2e7d32);
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
