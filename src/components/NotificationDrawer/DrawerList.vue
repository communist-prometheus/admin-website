<script setup lang="ts">
import type { HistoryEntry } from '@/stores/notifications-history'
import HistoryItem from './HistoryItem.vue'
import { DRAWER_TEST_IDS } from './test-ids'

defineProps<{ readonly entries: ReadonlyArray<HistoryEntry> }>()
defineEmits<{ readonly dismiss: [id: string] }>()
</script>

<template>
  <section
    v-if="entries.length === 0"
    class="drawer-empty"
    :data-testid="DRAWER_TEST_IDS.empty"
  >
    No notifications.
  </section>
  <ul v-else class="drawer-list">
    <HistoryItem
      v-for="entry in entries"
      :key="entry.id"
      :entry="entry"
      @dismiss="$emit('dismiss', $event)"
    />
  </ul>
</template>

<style scoped>
.drawer-empty {
  padding: 24px;
  text-align: center;
  color: var(--color-text-muted, #888);
  font-size: 0.875rem;
}

.drawer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
