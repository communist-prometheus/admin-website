<script setup lang="ts">
import EditorFooter from '@/components/MarkdownEditor/EditorFooter.vue'
import FrontmatterEditor from '@/components/MarkdownEditor/FrontmatterEditor.vue'
import MarkdownEditorBody from '@/components/MarkdownEditor/MarkdownEditorBody.vue'
import type { ContentType } from '@/types/content'

defineProps<{
  readonly bodyContent: string
  readonly frontmatterData: Record<string, unknown>
  readonly contentType: ContentType
  readonly loadingFile: boolean
  readonly assetUrlMap?: ReadonlyMap<string, string>
}>()

defineEmits<{
  'update:bodyContent': [value: string]
  'update:frontmatter': [data: Record<string, unknown>]
  save: [message: string]
  'paste:image': [file: File]
}>()
</script>

<template>
  <section class="edit-main" data-testid="markdown-editor">
    <div v-if="loadingFile" class="loading-state">
      Loading file...
    </div>
    <template v-else>
      <FrontmatterEditor
        v-if="Object.keys(frontmatterData).length > 0"
        :frontmatter="frontmatterData"
        :content-type="contentType"
        @update:frontmatter="$emit('update:frontmatter', $event)"
      />
      <MarkdownEditorBody
        :model-value="bodyContent"
        :asset-url-map="assetUrlMap"
        @update:model-value="$emit('update:bodyContent', $event)"
        @paste:image="$emit('paste:image', $event)"
      />
      <EditorFooter
        :disabled="false"
        @save="$emit('save', $event)"
      />
    </template>
  </section>
</template>

<style scoped>
.edit-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: clamp(0.5rem, 2vw, 1rem);
  padding: clamp(1rem, 3vw, 2rem);
  overflow: auto;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 2.5vw, 1.25rem);
}
</style>
