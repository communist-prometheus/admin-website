<script setup lang="ts">
import { Marked } from 'marked'
import { computed } from 'vue'
import { createAssetExtension } from './create-asset-renderer'

const props = defineProps<{
  readonly content: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
}>()

const html = computed(() => {
  const m = new Marked()
  if (props.assetUrlMap && props.assetUrlMap.size > 0) {
    m.use(createAssetExtension(props.assetUrlMap))
  }
  return m.parse(props.content, { async: false })
})
</script>

<template>
  <article
    class="markdown-preview"
    data-testid="markdown-preview"
    v-html="html"
  />
</template>

<style scoped>
.markdown-preview {
  flex: 1;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
  overflow: auto;
}
</style>

<style src="./prose.css" />
