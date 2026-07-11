<script setup lang="ts">
import MagazineSourceUploads from '@/components/MarkdownEditor/MagazineSourceUploads.vue'
import MarkdownEditorBody from '@/components/MarkdownEditor/MarkdownEditorBody.vue'
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
  'paste:image': [file: File]
  'upload-asset': [file: File]
  'set-cover': [name: string]
  error: [message: string]
}>()

const isMagazine = (type: ContentType) => type === 'magazine'

const fmString = (key: string): string | undefined => {
  const v = props.frontmatterData[key]
  return typeof v === 'string' && v.length > 0 ? v : undefined
}
</script>

<template>
  <section class="edit-body-area">
    <MagazineSourceUploads
      v-if="isMagazine(contentType) && slug"
      :assets="assets"
      :slug="slug"
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
