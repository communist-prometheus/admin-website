<script setup lang="ts">
import FrontmatterEditor from '@/components/MarkdownEditor/FrontmatterEditor.vue'
import type { AssetDisplay } from '@/composables/useAssets/types'
import type { ContentType } from '@/types/content'
import EditBodyArea from './EditBodyArea.vue'

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
</script>

<template>
  <FrontmatterEditor
    v-if="Object.keys(frontmatterData).length > 0"
    class="edit-meta"
    :frontmatter="frontmatterData"
    :content-type="contentType"
    :slug="slug"
    @update:frontmatter="$emit('update:frontmatter', $event)"
  />
  <EditBodyArea
    class="edit-body"
    :body-content="bodyContent"
    :frontmatter-data="frontmatterData"
    :content-type="contentType"
    :slug="slug"
    :asset-url-map="assetUrlMap"
    :assets="assets"
    @update:body-content="$emit('update:bodyContent', $event)"
    @preview="$emit('preview')"
    @paste:image="$emit('paste:image', $event)"
    @upload-asset="$emit('upload-asset', $event)"
    @set-cover="$emit('set-cover', $event)"
    @error="$emit('error', $event)"
  />
</template>

<style scoped>
.edit-meta {
  grid-column: meta;
  align-self: start;
}

.edit-body {
  grid-column: body;
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  min-width: 0;
}
</style>
