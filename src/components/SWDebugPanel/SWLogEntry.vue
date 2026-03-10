<script setup lang="ts">
import type { LogEntry } from '@/sw/protocol'
import { formatTimestamp } from './format-timestamp'
import { logLevelColor } from './log-level-color'

const props = defineProps<{
  readonly entry: LogEntry
}>()

const time = formatTimestamp(props.entry.ts)
const color = logLevelColor(props.entry.level)
const catLabel = `[${props.entry.cat}]`
</script>

<template>
  <li class="log-entry" data-testid="sw-log-entry">
    <time :style="{ color: '#999' }">{{ time }}</time>
    <span
      class="log-level"
      :style="{ color }"
    >{{ entry.level.toUpperCase().padEnd(5) }}</span>
    <span class="log-cat">{{ catLabel }}</span>
    <span class="log-msg">{{ entry.msg }}</span>
  </li>
</template>

<style scoped>
.log-entry {
  display: flex;
  gap: 0.5em;
  font-family: monospace;
  font-size: 0.75rem;
  line-height: 1.4;
  padding: 1px 0;
  white-space: nowrap;
}

.log-cat {
  color: #aaa;
}

.log-msg {
  color: #e0e0e0;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
