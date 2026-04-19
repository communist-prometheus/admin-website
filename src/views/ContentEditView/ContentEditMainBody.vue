<script setup lang="ts">
import EditorFooter from '@/components/MarkdownEditor/EditorFooter.vue'
import FrontmatterEditor from '@/components/MarkdownEditor/FrontmatterEditor.vue'
import MarkdownEditorBody from '@/components/MarkdownEditor/MarkdownEditorBody.vue'
import PdfUpload from '@/components/MarkdownEditor/PdfUpload.vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import type { ContentType } from '@/types/content'

defineProps<{
  readonly bodyContent: string
  readonly frontmatterData: Record<string, unknown>
  readonly contentType: ContentType
  readonly slug?: string
  readonly saving: boolean
  readonly saved: boolean
  readonly assetUrlMap?: ReadonlyMap<string, string>
  readonly assets?: readonly AssetDisplay[]
}>()

defineEmits<{
  'update:bodyContent': [value: string]
  'update:frontmatter': [data: Record<string, unknown>]
  save: []
  'paste:image': [file: File]
  'upload-asset': [file: File]
  'set-cover': [name: string]
}>()

const isNewspaper = (type: ContentType) => type === 'newspaper'
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
    @upload-pdf="$emit('upload-asset', $event)"
    @upload-cover="$emit('upload-asset', $event)"
    @set-cover="$emit('set-cover', $event)"
  />
  <MarkdownEditorBody
    v-else
    :model-value="bodyContent"
    :asset-url-map="assetUrlMap"
    :assets="assets"
    @update:model-value="$emit('update:bodyContent', $event)"
    @paste:image="$emit('paste:image', $event)"
    @upload-asset="$emit('upload-asset', $event)"
  />
  <EditorFooter
    :disabled="false"
    :saving="saving"
    :saved="saved"
    @save="$emit('save')"
  />
</template>
