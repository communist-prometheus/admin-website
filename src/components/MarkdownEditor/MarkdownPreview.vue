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
  padding: clamp(0.75rem, 2vw, 1rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  color: var(--color-text);
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.6;
  overflow: auto;
}
</style>

<style>
.markdown-preview h1 {
  font-size: 1.75em;
  margin: 0 0 0.5em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.25em;
}

.markdown-preview h2 {
  font-size: 1.4em;
  margin: 1em 0 0.5em;
}

.markdown-preview h3 {
  font-size: 1.15em;
  margin: 0.75em 0 0.5em;
}

.markdown-preview p { margin: 0 0 0.75em; }

.markdown-preview ul,
.markdown-preview ol {
  padding-left: 1.5em;
  margin: 0 0 0.75em;
}

.markdown-preview code {
  padding: 0.15em 0.35em;
  border-radius: 3px;
  background: var(--color-background-soft);
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-preview pre {
  padding: 0.75em 1em;
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  overflow-x: auto;
  margin: 0 0 0.75em;
}

.markdown-preview pre code {
  padding: 0;
  background: transparent;
}

.markdown-preview a {
  color: var(--color-accent, #42b883);
  text-decoration: underline;
}

.markdown-preview blockquote {
  border-left: 3px solid var(--color-border);
  padding-left: 1em;
  margin: 0 0 0.75em;
  color: var(--color-text-secondary);
}

.markdown-preview strong { font-weight: 700; }

.markdown-preview img {
  max-width: 100%;
  border-radius: var(--radius-md);
}
</style>
