<script setup lang="ts">
import { ref, watch } from 'vue'
import EditorFooter from './EditorFooter.vue'
import EditorHeader from './EditorHeader.vue'

const props = defineProps<{
  readonly modelValue: string
  readonly filePath: string | null
  readonly loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  save: [message: string]
}>()

const content = ref(props.modelValue)

watch(() => props.modelValue, (newValue) => {
  content.value = newValue
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  content.value = target.value
  emit('update:modelValue', target.value)
}

const handleSave = (message: string) => {
  emit('save', message)
}
</script>

<template>
  <div class="markdown-editor" data-testid="markdown-editor">
    <p v-if="!filePath">Select a file to edit</p>
    <div v-else-if="loading" class="loading-state">Loading file...</div>
    <EditorHeader v-else :file-path="filePath" />
    <textarea v-if="filePath && !loading" :value="content" @input="handleInput" />
    <EditorFooter v-if="filePath && !loading" :disabled="false" @save="handleSave" />
  </div>
</template>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: clamp(0.5rem, 2vw, 1rem);
}

textarea {
  flex: 1;
  padding: clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  font-family: 'Courier New', monospace;
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.6;
  resize: none;
}

p,
.loading-state {
  padding: clamp(1rem, 3vw, 2rem);
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  text-align: center;
}
</style>
