<script setup lang="ts">
import ContentList from '@/components/ContentList/ContentList.vue'
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue'
import type { ContentItem, Language } from '@/types/content'

defineProps<{
  readonly items: readonly ContentItem[]
  readonly selectedLang: Language
  readonly selectedPath: string | null
  readonly fileContent: string
  readonly isAuthenticated: boolean
  readonly loading?: boolean
  readonly loadingFile?: boolean
}>()

const emit = defineEmits<{
  select: [item: ContentItem]
  create: []
  save: [message: string]
  'update:fileContent': [value: string]
}>()
</script>

<template>
  <div class="view-content">
    <ContentList
      :items="items"
      :selected-lang="selectedLang"
      :selected-path="selectedPath"
      :loading="loading"
      @select="emit('select', $event)"
      @create="isAuthenticated ? emit('create') : undefined"
    />
    
    <MarkdownEditor
      v-if="isAuthenticated"
      :model-value="fileContent"
      :file-path="selectedPath"
      :loading="loadingFile"
      @update:model-value="emit('update:fileContent', $event)"
      @save="emit('save', $event)"
    />
    <div v-else class="auth-required">
      <p>Please log in to edit content</p>
    </div>
  </div>
</template>

<style scoped>
.view-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 2rem);
  flex: 1;
  overflow: hidden;
}

.auth-required {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 2vw, 1.25rem);
}
</style>
