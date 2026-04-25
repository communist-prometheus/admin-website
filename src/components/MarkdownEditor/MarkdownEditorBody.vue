<script setup lang="ts">
import { ref } from 'vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import CommandPanel from './CommandPanel.vue'
import { createPasteDrop } from './editor-paste-drop'
import { handleKeyboard } from './handle-keyboard'
import { insertUploadTag } from './handle-upload'
import ImportDocsButton from './ImportDocs/ImportDocsButton.vue'
import { insertImported } from './ImportDocs/insert-imported'
import { execBlock, execMedia, execWrap } from './use-commands'

defineProps<{
  readonly modelValue: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
  readonly assets?: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'paste:image': [file: File]
  'upload-asset': [file: File]
  error: [message: string]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const emitUpload = (f: File) => emit('upload-asset', f)
const { onPaste, onDrop } = createPasteDrop({
  textareaRef,
  emitPaste: f => emit('paste:image', f),
  emitUpload,
})

const handleInput = (event: Event) => {
  if (!(event.target instanceof HTMLTextAreaElement)) return
  emit('update:modelValue', event.target.value)
}

const wrap = (pre: string, suf: string) => {
  if (textareaRef.value) execWrap(textareaRef.value, pre, suf)
}

const handleUpload = (file: File) => {
  if (!textareaRef.value) return
  insertUploadTag(textareaRef.value, file)
  emitUpload(file)
}

const handleImported = (markdown: string, images: readonly File[]) =>
  insertImported(textareaRef.value, markdown, images, emitUpload)
</script>

<template>
  <section class="editor-body">
    <ImportDocsButton
      @imported="handleImported"
      @error="msg => $emit('error', msg)"
    />
    <CommandPanel
      :assets="assets"
      @wrap="wrap"
      @block="p => textareaRef && execBlock(textareaRef, p)"
      @insert-media="t => textareaRef && execMedia(textareaRef, t)"
      @upload-asset="handleUpload"
    />
    <textarea
      ref="textareaRef"
      data-testid="editor-body"
      :value="modelValue"
      @input="handleInput"
      @paste="onPaste"
      @drop="onDrop"
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
