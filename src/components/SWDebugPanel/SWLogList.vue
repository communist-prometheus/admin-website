<script setup lang="ts">
import type { LogEntry } from '@/sw/protocol'
import SWLogEntry from './SWLogEntry.vue'

defineProps<{
  readonly entries: readonly LogEntry[]
}>()
</script>

<template>
  <ol class="sw-log-list" data-testid="sw-log-list">
    <SWLogEntry
      v-for="(entry, i) in entries"
      :key="i"
      :entry="entry"
    />
    <li v-if="entries.length === 0" class="sw-log-empty">
      No log entries yet
    </li>
  </ol>
</template>

<style scoped>
.sw-log-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5em 1em;
  margin: 0;
  list-style: none;
}

.sw-log-empty {
  color: #666;
  font-style: italic;
  font-size: 0.8rem;
}
</style>
