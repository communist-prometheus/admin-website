<script setup lang="ts">
import { VISUAL_MERGE_TEST_IDS } from './test-ids'

const props = defineProps<{
  readonly ours: string
  readonly theirs: string
  readonly merged: string
}>()
const emit = defineEmits<{ readonly update: [next: string] }>()

const onInput = (event: Event): void => {
  const target = event.target
  const value =
    target instanceof HTMLTextAreaElement ? target.value : props.merged
  emit('update', value)
}
</script>

<template>
  <article class="merge-editor">
    <pre
      class="pane ours"
      :data-testid="VISUAL_MERGE_TEST_IDS.ours"
    >{{ ours }}</pre>
    <textarea
      class="pane merged"
      :data-testid="VISUAL_MERGE_TEST_IDS.merged"
      :value="merged"
      spellcheck="false"
      @input="onInput"
    />
    <pre
      class="pane theirs"
      :data-testid="VISUAL_MERGE_TEST_IDS.theirs"
    >{{ theirs }}</pre>
  </article>
</template>

<style scoped>
.merge-editor {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  min-height: 320px;
}

.pane {
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  padding: 8px;
  font-family: monospace;
  font-size: 0.8125rem;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow: auto;
  background: var(--color-surface, #fff);
}

.pane.ours {
  border-left: 3px solid var(--color-accent, #4fc3f7);
}

.pane.theirs {
  border-left: 3px solid var(--color-warning, #ffb74d);
}

.pane.merged {
  border-left: 3px solid var(--color-success, #43a047);
  resize: vertical;
}
</style>
