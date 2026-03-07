<script setup lang="ts">
import type { ContentType } from '@/types/content'
import EditorFooter from './EditorFooter.vue'
import EditorHeader from './EditorHeader.vue'
import FrontmatterEditor from './FrontmatterEditor.vue'
import MarkdownEditorBody from './MarkdownEditorBody.vue'

defineProps<{
  readonly modelValue: string
  readonly filePath: string | null
  readonly loading?: boolean
  readonly frontmatter?: Record<string, unknown>
  readonly contentType?: ContentType
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:frontmatter': [data: Record<string, unknown>]
  save: [message: string]
}>()
</script>

<template>
  <div class="markdown-editor" data-testid="markdown-editor">
    <p v-if="!filePath">Select a file to edit</p>
    <div v-else-if="loading" class="loading-state">Loading file...</div>
    <EditorHeader v-else :file-path="filePath" />
    <FrontmatterEditor
      v-if="filePath && !loading && frontmatter && contentType"
      :frontmatter="frontmatter"
      :content-type="contentType"
      @update:frontmatter="emit('update:frontmatter', $event)"
    />
    <MarkdownEditorBody
      v-if="filePath && !loading"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <EditorFooter v-if="filePath && !loading" :disabled="false" @save="emit('save', $event)" />
  </div>
</template>

<style scoped>
.markdown-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: clamp(0.5rem, 2vw, 1rem);
  overflow: auto;
}

p,
.loading-state {
  padding: clamp(1rem, 3vw, 2rem);
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  text-align: center;
}
</style>
