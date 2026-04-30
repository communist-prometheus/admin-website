<script setup lang="ts">
import type { TraceGroup } from './group-by-trace'

defineProps<{
  readonly group: TraceGroup
}>()
defineEmits<{ readonly select: [traceId: string] }>()
</script>

<template>
  <button
    type="button"
    class="trace-btn"
    @click="$emit('select', group.traceId)"
  >
    <code class="id">{{ group.traceId.slice(0, 8) }}</code>
    <span class="count">{{ group.spans.length }}</span>
  </button>
</template>

<style scoped>
.trace-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 8px;
  background: transparent;
  border: 0;
  color: #ddd;
  font-family: monospace;
  font-size: 12px;
  cursor: pointer;
  border-radius: 3px;
}

.trace-btn:hover {
  background: #1a2230;
}

.id {
  color: #4fc3f7;
}

.count {
  color: #888;
  font-size: 11px;
}
</style>
