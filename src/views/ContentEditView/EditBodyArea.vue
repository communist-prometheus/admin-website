<script setup lang="ts">
import EditorFooter from '@/components/MarkdownEditor/EditorFooter.vue'
import MarkdownEditorBody from '@/components/MarkdownEditor/MarkdownEditorBody.vue'
import NewspaperSourceUploads from '@/components/MarkdownEditor/NewspaperSourceUploads.vue'
import { hasBodyEditor } from '@/components/MarkdownEditor/page-body-policy'
import type { AssetDisplay } from '@/composables/useAssets/types'
import type { ContentType } from '@/types/content'

const props = defineProps<{
  readonly bodyContent: string
  readonly frontmatterData: Record<string, unknown>
  readonly contentType: ContentType
  readonly slug?: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
  readonly assets?: readonly AssetDisplay[]
}>()

defineEmits<{
  'update:bodyContent': [value: string]
  preview: []
  'paste:image': [file: File]
  'upload-asset': [file: File]
  'set-cover': [name: string]
  error: [message: string]
}>()

const isNewspaper = (type: ContentType) => type === 'newspaper'

const fmString = (key: string): string | undefined => {
  const v = props.frontmatterData[key]
  return typeof v === 'string' && v.length > 0 ? v : undefined
}
</script>

<template>
  <section class="edit-body-area">
    <NewspaperSourceUploads
      v-if="isNewspaper(contentType)"
      :assets="assets"
      :current-cover="fmString('image')"
      :issue-title="fmString('title')"
      :issue-lang="fmString('lang')"
      @upload-asset="$emit('upload-asset', $event)"
      @set-cover="$emit('set-cover', $event)"
      @error="$emit('error', $event)"
    />
    <MarkdownEditorBody
      v-else-if="hasBodyEditor(contentType, slug)"
      :model-value="bodyContent"
      :asset-url-map="assetUrlMap"
      :assets="assets"
      @update:model-value="$emit('update:bodyContent', $event)"
      @paste:image="$emit('paste:image', $event)"
      @upload-asset="$emit('upload-asset', $event)"
      @error="$emit('error', $event)"
    />
    <EditorFooter :disabled="false" @preview="$emit('preview')" />
  </section>
</template>

<style scoped>
.edit-body-area {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  min-width: 0;
}
</style>
