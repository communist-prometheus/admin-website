<script setup lang="ts">
import { ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import CommandPanel from './CommandPanel.vue'
import { buildDropTag, extractDropFile } from './handle-drop'
import { handleKeyboard } from './handle-keyboard'
import { buildPasteTag, extractMediaFile } from './handle-paste'
import { insertUploadTag } from './handle-upload'
import MarkdownPreview from './MarkdownPreview.vue'
import PreviewToggle from './PreviewToggle.vue'
import { execBlock, execMedia, execWrap } from './use-commands'

const props = defineProps<{
  readonly modelValue: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
  readonly assets?: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'paste:image': [file: File]
  'upload-asset': [file: File]
}>()

const previewing = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()
const emitUpload = (f: File) => emit('upload-asset', f)

const handleInput = (event: Event) => {
  if (!(event.target instanceof HTMLTextAreaElement)) return
  emit('update:modelValue', event.target.value)
}

const wrap = (pre: string, suf: string) => {
  if (textareaRef.value) execWrap(textareaRef.value, pre, suf)
}

const handlePaste = (event: ClipboardEvent) => {
  const file = extractMediaFile(event)
  if (!file || !textareaRef.value) return
  event.preventDefault()
  document.execCommand('insertText', false, buildPasteTag(file))
  emit('paste:image', file)
}

const handleDrop = (event: DragEvent) => {
  const file = extractDropFile(event)
  if (!file || !textareaRef.value) return
  event.preventDefault()
  document.execCommand('insertText', false, buildDropTag(file))
  emitUpload(file)
}

const handleUpload = (file: File) => {
  if (!textareaRef.value) return
  insertUploadTag(textareaRef.value, file)
  emitUpload(file)
}
</script>

<template>
  <section class="editor-body">
    <PreviewToggle
      :previewing="previewing"
      @toggle="() => { previewing = !previewing }"
    />
    <MarkdownPreview
      v-if="previewing"
      :content="modelValue"
      :asset-url-map="assetUrlMap"
    />
    <CommandPanel
      v-if="!previewing"
      :assets="assets"
      @wrap="wrap"
      @block="p => textareaRef && execBlock(textareaRef, p)"
      @insert-media="t => textareaRef && execMedia(textareaRef, t)"
      @upload-asset="handleUpload"
    />
    <textarea
      v-if="!previewing"
      ref="textareaRef"
      data-testid="editor-body"
      :value="modelValue"
      @input="handleInput"
      @paste="handlePaste"
      @drop="handleDrop"
      @dragover.prevent
      @keydown="e => handleKeyboard(e, wrap)"
    />
  </section>
</template>

<style scoped>
.editor-body {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vw, 0.5rem);
}

textarea {
  field-sizing: content;
  min-height: 200px;
  width: 100%;
  padding: clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  font-family: 'Courier New', monospace;
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.6;
}
</style>
