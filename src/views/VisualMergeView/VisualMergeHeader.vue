<script setup lang="ts">
import { VISUAL_MERGE_TEST_IDS } from './test-ids'

defineProps<{ readonly file: string }>()
defineEmits<{
  readonly save: []
  readonly cancel: []
}>()
</script>

<template>
  <header class="head">
    <strong class="title">Resolve {{ file }}</strong>
    <button
      type="button"
      class="cancel"
      :data-testid="VISUAL_MERGE_TEST_IDS.cancel"
      @click="$emit('cancel')"
    >
      Cancel
    </button>
    <button
      type="button"
      class="save"
      :data-testid="VISUAL_MERGE_TEST_IDS.save"
      @click="$emit('save')"
    >
      Save merged
    </button>
  </header>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  font-size: 1rem;
  margin-right: auto;
  font-family: monospace;
}

.cancel,
.save {
  font-size: 0.8125rem;
  padding: 6px 12px;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  cursor: pointer;
}

.save {
  background: var(--color-accent, #4fc3f7);
  color: #fff;
  border-color: transparent;
  font-weight: 700;
}
</style>
