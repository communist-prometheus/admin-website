<script setup lang="ts">
import type { TraceGroup } from './group-by-trace'
import TraceRowButton from './TraceRowButton.vue'
import { TRACE_OVERLAY_TEST_IDS } from './test-ids'

defineProps<{
  readonly group: TraceGroup
  readonly active: boolean
}>()
defineEmits<{ readonly select: [traceId: string] }>()
</script>

<template>
  <li
    class="row"
    :data-testid="TRACE_OVERLAY_TEST_IDS.traceRow"
    :data-active="String(active)"
  >
    <TraceRowButton
      :group="group"
      @select="$emit('select', $event)"
    />
  </li>
</template>

<style scoped>
.row[data-active='true'] :deep(.trace-btn) {
  background: #1c2a3a;
}
</style>
