<script setup lang="ts">
import { Marked } from 'marked'
import markedFootnote from 'marked-footnote'
import { computed } from 'vue'
import { createAssetExtension } from './create-asset-renderer'

const props = defineProps<{
  readonly content: string
  readonly assetUrlMap?: ReadonlyMap<string, string>
}>()

/*
 * GFM footnotes: `[^N]` in the body becomes a superscript link to
 * `#user-content-fn-N`, and `[^N]: text` defines a list block at
 * the bottom whose `↩` link goes back to the marker. The plugin
 * generates matching `id` attributes so anchor navigation works
 * inside this preview AND on the public site (Astro's remark-gfm
 * emits the same shape, so the markdown round-trips identically).
 */
const html = computed(() => {
  const m = new Marked()
  m.use(markedFootnote())
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
