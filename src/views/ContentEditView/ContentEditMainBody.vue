<script setup lang="ts">
import DocxUpload from '@/components/MarkdownEditor/DocxUpload.vue'
import EditorFooter from '@/components/MarkdownEditor/EditorFooter.vue'
import FrontmatterEditor from '@/components/MarkdownEditor/FrontmatterEditor.vue'
import MarkdownEditorBody from '@/components/MarkdownEditor/MarkdownEditorBody.vue'
import PdfUpload from '@/components/MarkdownEditor/PdfUpload.vue'
import { hasBodyEditor } from '@/components/MarkdownEditor/page-body-policy'
import type { AssetDisplay } from '@/composables/useAssets/types'
import type { ContentType } from '@/types/content'

defineProps<{
  readonly bodyContent: string
  readonly frontmatterData: Record<string, unknown>
  readonly contentType: ContentType
  readonly slug?: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
  readonly assets?: readonly AssetDisplay[]
}>()

defineEmits<{
  'update:bodyContent': [value: string]
  'update:frontmatter': [data: Record<string, unknown>]
  preview: []
  'paste:image': [file: File]
  'upload-asset': [file: File]
  'set-cover': [name: string]
  error: [message: string]
}>()

const isNewspaper = (type: ContentType) => type === 'newspaper'

const currentCover = (fm: Record<string, unknown>): string | undefined => {
  const v = fm['image']
  return typeof v === 'string' && v.length > 0 ? v : undefined
}
</script>

<template>
  <FrontmatterEditor
    v-if="Object.keys(frontmatterData).length > 0"
    :frontmatter="frontmatterData"
    :content-type="contentType"
    :slug="slug"
    @update:frontmatter="$emit('update:frontmatter', $event)"
  />
  <PdfUpload
    v-if="isNewspaper(contentType)"
    :assets="assets"
    :current-cover="currentCover(frontmatterData)"
    @upload-pdf="$emit('upload-asset', $event)"
    @upload-cover="$emit('upload-asset', $event)"
    @set-cover="$emit('set-cover', $event)"
  />
  <DocxUpload
    v-if="isNewspaper(contentType)"
    :assets="assets"
    @upload-docx="$emit('upload-asset', $event)"
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
  <EditorFooter
    :disabled="false"
    @preview="$emit('preview')"
  />
</template>
