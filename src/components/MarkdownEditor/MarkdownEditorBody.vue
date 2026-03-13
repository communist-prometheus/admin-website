<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { extractImageFile } from './handle-paste-image'
import { insertAtCursor } from './insert-at-cursor'
import MarkdownPreview from './MarkdownPreview.vue'
import PreviewToggle from './PreviewToggle.vue'

const props = defineProps<{
  readonly modelValue: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'paste:image': [file: File]
}>()

const previewing = ref(false)
const textareaRef = ref<HTMLTextAreaElement>()

const togglePreview = () => {
  previewing.value = !previewing.value
}

const emitValue = (v: string) => {
  emit('update:modelValue', v)
}

const handleInput = (event: Event) => {
  if (!(event.target instanceof HTMLTextAreaElement)) return
  emitValue(event.target.value)
}

const handlePaste = (event: ClipboardEvent) => {
  const file = extractImageFile(event)
  if (!file) return
  event.preventDefault()
  const pos = textareaRef.value?.selectionStart ?? 0
  const tag = `\n![${file.name}](./assets/${file.name})\n`
  emitValue(insertAtCursor(props.modelValue, pos, tag))
  emit('paste:image', file)
  nextTick(() => {
    const newPos = pos + tag.length
    textareaRef.value?.setSelectionRange(newPos, newPos)
  })
}
</script>

<template>
  <section class="editor-body">
    <PreviewToggle
      :previewing="previewing"
      @toggle="togglePreview"
    />
    <MarkdownPreview
      v-if="previewing"
      :content="modelValue"
      :asset-url-map="assetUrlMap"
    />
    <textarea
      v-else
      ref="textareaRef"
      data-testid="editor-body"
      :value="modelValue"
      @input="handleInput"
      @paste="handlePaste"
    />
  </section>
</template>

<style scoped>
.editor-body {
  display: flex;
  flex-direction: column;
  gap: clamp(0.25rem, 0.5vw, 0.5rem);
  overflow: auto;
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
