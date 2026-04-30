<script setup lang="ts">
import type { Span } from '@/composables/useTracing'
import { TRACE_OVERLAY_TEST_IDS } from './test-ids'

defineProps<{
  readonly span: Span
  readonly offset: string
  readonly width: string
}>()
</script>

<template>
  <li
    class="row"
    :data-testid="TRACE_OVERLAY_TEST_IDS.spanRow"
    :data-status="span.status"
  >
    <span class="name">{{ span.name }}</span>
    <span class="bar" :style="{ marginLeft: offset, width }" />
  </li>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: 160px 1fr;
  align-items: center;
  font-size: 11px;
  font-family: monospace;
}

.name {
  color: #ddd;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar {
  height: 12px;
  background: #4fc3f7;
  border-radius: 2px;
  display: inline-block;
}

.row[data-status='error'] .bar {
  background: #e57373;
}
</style>
