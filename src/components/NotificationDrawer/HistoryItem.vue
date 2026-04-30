<script setup lang="ts">
import type { HistoryEntry } from '@/stores/notifications-history'
import { DRAWER_TEST_IDS } from './test-ids'

defineProps<{ readonly entry: HistoryEntry }>()
defineEmits<{ readonly dismiss: [id: string] }>()
</script>

<template>
  <article
    :data-testid="DRAWER_TEST_IDS.item"
    :data-kind="entry.kind"
    :data-read="String(entry.readAt !== undefined)"
    :class="['history-item', `history-item-kind-${entry.kind}`]"
  >
    <strong class="history-item-title">{{ entry.title }}</strong>
    <span v-if="entry.message" class="history-item-message">
      {{ entry.message }}
    </span>
    <button
      type="button"
      class="history-item-dismiss"
      :aria-label="`dismiss ${entry.kind} entry`"
      :data-testid="DRAWER_TEST_IDS.itemDismiss"
      @click="$emit('dismiss', entry.id)"
    >
      ×
    </button>
  </article>
</template>

<style scoped>
.history-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 4px;
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #ddd);
  position: relative;
}

.history-item[data-read='false'] {
  border-left: 3px solid var(--color-accent, #4fc3f7);
}

.history-item-kind-error,
.history-item-kind-conflict { border-color: #e57373; }

.history-item-title {
  font-size: 0.875rem;
  font-weight: 700;
}

.history-item-message {
  font-size: 0.8125rem;
  color: var(--color-text, #444);
}

.history-item-dismiss {
  position: absolute;
  top: 6px;
  right: 6px;
  background: transparent;
  border: 0;
  font-size: 1rem;
  cursor: pointer;
  color: inherit;
  min-width: 28px;
  min-height: 28px;
  border-radius: 4px;
}

.history-item-dismiss:hover,
.history-item-dismiss:focus-visible {
  background: rgb(0 0 0 / 6%);
  outline: none;
}
</style>
