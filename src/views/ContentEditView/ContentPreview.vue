<script setup lang="ts">
import MarkdownPreview from '@/components/MarkdownEditor/MarkdownPreview.vue'
import PreviewHeader from './PreviewHeader.vue'

defineProps<{
  readonly bodyContent: string
  readonly frontmatterData: Record<string, unknown>
  readonly coverUrl?: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
}>()
</script>

<template>
  <article class="content-preview" data-testid="content-preview">
    <PreviewHeader
      :frontmatter="frontmatterData"
      :cover-url="coverUrl"
    />
    <MarkdownPreview
      :content="bodyContent"
      :asset-url-map="assetUrlMap"
    />
  </article>
</template>

<style scoped>
.content-preview {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  max-width: 800px;
  margin-inline: auto;
  padding: clamp(1rem, 3vw, 2rem);
}
</style>
