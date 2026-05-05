<script setup lang="ts">
import type { AssetDisplay } from '@/composables/useAssets/types'
import CmdButton from './CommandPanel/CmdButton.vue'
import MediaPicker from './CommandPanel/MediaPicker.vue'
import { BLOCK_CMDS, WRAP_CMDS } from './command-defs'
import { buildInsertableMediaTag } from './insertable-media'
import { COMMAND_PANEL_ID } from './test-ids'

defineProps<{
  readonly assets?: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  wrap: [pre: string, suf: string]
  block: [prefix: string]
  'insert-media': [tag: string]
  'insert-footnote': []
  'upload-asset': [file: File]
}>()

const onMedia = (a: AssetDisplay) => {
  const tag = buildInsertableMediaTag(a.name, a.mimeType)
  if (tag) emit('insert-media', tag)
}
</script>

<template>
  <nav
    :data-testid="COMMAND_PANEL_ID"
    class="command-panel"
    aria-label="Formatting toolbar"
  >
    <CmdButton
      v-for="c in WRAP_CMDS"
      :key="c.label"
      :label="c.label"
      :title="c.title"
      :test-id="c.testId"
      @click="$emit('wrap', c.pre, c.suf)"
    />
    <span class="sep" aria-hidden="true" />
    <CmdButton
      v-for="c in BLOCK_CMDS"
      :key="c.label"
      :label="c.label"
      :title="c.title"
      @click="$emit('block', c.prefix)"
    />
    <CmdButton
      label="{ }"
      title="Code block"
      @click="$emit('block', '```\n')"
    />
    <CmdButton
      label="―"
      title="Horizontal rule"
      @click="$emit('block', '---\n')"
    />
    <CmdButton
      label="[†]"
      title="Footnote (insert [^N] + definition)"
      test-id="cmd-footnote"
      @click="$emit('insert-footnote')"
    />
    <span
      v-if="assets"
      class="sep"
      aria-hidden="true"
    />
    <MediaPicker
      v-if="assets"
      :assets="assets"
      @select="onMedia"
      @upload="$emit('upload-asset', $event)"
    />
  </nav>
</template>

<style scoped>
.command-panel {
  position: sticky;
  top: calc(var(--header-height, 60px) + var(--header-offset, 0px));
  z-index: var(--z-sticky);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background-soft);
  flex-wrap: wrap;
}

.sep {
  width: 1px;
  height: 1.25rem;
  background: var(--color-border);
}
</style>
