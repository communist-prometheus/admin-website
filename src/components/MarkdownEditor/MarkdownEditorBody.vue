<script setup lang="ts">
import { ref } from 'vue'
import MarkdownPreview from './MarkdownPreview.vue'
import PreviewToggle from './PreviewToggle.vue'

defineProps<{
  readonly modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const previewing = ref(false)
const togglePreview = () => { previewing.value = !previewing.value }

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <section class="editor-body">
    <PreviewToggle :previewing="previewing" @toggle="togglePreview" />
    <MarkdownPreview v-if="previewing" :content="modelValue" />
    <textarea
      v-else
      data-testid="editor-body"
      :value="modelValue"
      @input="handleInput"
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
