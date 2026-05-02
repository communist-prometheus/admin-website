<script setup lang="ts">
import type { AssetDisplay } from '@/composables/useAssets/types'
import type { ContentType } from '@/types/content'
import ContentEditMainBody from './ContentEditMainBody.vue'

defineProps<{
  readonly bodyContent: string
  readonly frontmatterData: Record<string, unknown>
  readonly contentType: ContentType
  readonly slug?: string
  readonly loadingFile: boolean
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
  <section class="edit-main" data-testid="markdown-editor">
    <p v-if="loadingFile" class="loading-state">
      Loading file...
    </p>
    <ContentEditMainBody
      v-else
      :body-content="bodyContent"
      :frontmatter-data="frontmatterData"
      :content-type="contentType"
      :slug="slug"
      :asset-url-map="assetUrlMap"
      :assets="assets"
      @update:body-content="$emit('update:bodyContent', $event)"
      @update:frontmatter="$emit('update:frontmatter', $event)"
      @preview="$emit('preview')"
      @paste:image="$emit('paste:image', $event)"
      @upload-asset="$emit('upload-asset', $event)"
      @set-cover="$emit('set-cover', $event)"
      @error="$emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.edit-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: clamp(0.5rem, 2vw, 1rem);
  padding: var(--content-frame-padding);
  max-width: var(--content-wide);
  width: 100%;
  margin-inline: auto;
  box-sizing: border-box;
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
