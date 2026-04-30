<script setup lang="ts">
import { CONFLICT_TEST_IDS } from './test-ids'

defineProps<{ readonly path: string }>()
</script>

<template>
  <li
    class="conflict-item"
    :data-testid="CONFLICT_TEST_IDS.item"
  >
    <code
      class="path"
      :data-testid="CONFLICT_TEST_IDS.filePath"
    >{{ path }}</code>
    <span class="status">conflict</span>
  </li>
</template>

<style scoped>
.conflict-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--color-border, #ddd);
  border-left: 3px solid var(--color-error, #e53935);
  border-radius: 4px;
  background: var(--color-surface, #fff);
}

.path {
  font-size: 0.8125rem;
  font-family: monospace;
}

.status {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-error, #e53935);
}
</style>
