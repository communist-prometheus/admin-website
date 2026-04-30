<script setup lang="ts">
import type { ResolveStrategy } from '@/sw/protocol/push-control'
import { CONFLICT_TEST_IDS } from './test-ids'

defineProps<{
  readonly path: string
  readonly resolved: ResolveStrategy | undefined
}>()
defineEmits<{
  readonly resolve: [strategy: ResolveStrategy]
}>()
</script>

<template>
  <li
    class="conflict-item"
    :data-testid="CONFLICT_TEST_IDS.item"
    :data-resolved="resolved ?? 'pending'"
  >
    <code class="path" :data-testid="CONFLICT_TEST_IDS.filePath">{{
      path
    }}</code>
    <span
      v-if="resolved !== undefined"
      class="status status-resolved"
      :data-testid="CONFLICT_TEST_IDS.resolved"
      >{{ resolved }}</span
    >
    <span v-else class="status">conflict</span>
    <button
      v-if="resolved === undefined"
      type="button"
      class="btn"
      :data-testid="CONFLICT_TEST_IDS.keepMine"
      @click="$emit('resolve', 'mine')"
    >
      keep mine
    </button>
    <button
      v-if="resolved === undefined"
      type="button"
      class="btn"
      :data-testid="CONFLICT_TEST_IDS.takeTheirs"
      @click="$emit('resolve', 'theirs')"
    >
      take theirs
    </button>
    <button
      v-if="resolved === undefined"
      type="button"
      class="btn force"
      :data-testid="CONFLICT_TEST_IDS.forceMine"
      @click="$emit('resolve', 'force-mine')"
    >
      force push mine
    </button>
  </li>
</template>

<style scoped>
.conflict-item {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--color-border, #ddd);
  border-left: 3px solid var(--color-error, #e53935);
  border-radius: 4px;
  background: var(--color-surface, #fff);
}

.conflict-item[data-resolved='mine'],
.conflict-item[data-resolved='theirs'],
.conflict-item[data-resolved='force-mine'] {
  border-left-color: var(--color-success, #43a047);
  opacity: 70%;
}

.path {
  font-size: 0.8125rem;
  font-family: monospace;
  flex: 1 1 auto;
}

.status {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-error, #e53935);
}

.status-resolved {
  color: var(--color-success, #43a047);
}

.btn {
  font-size: 0.75rem;
  padding: 3px 8px;
  border: 1px solid var(--color-border, #ddd);
  background: transparent;
  border-radius: 3px;
  cursor: pointer;
}

.btn.force {
  border-color: var(--color-error, #e53935);
  color: var(--color-error, #e53935);
}
</style>
