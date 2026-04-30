<script setup lang="ts">
import type { TraceGroup } from './group-by-trace'
import TraceRow from './TraceRow.vue'

defineProps<{
  readonly groups: ReadonlyArray<TraceGroup>
  readonly activeId: string | undefined
}>()
defineEmits<{
  readonly select: [traceId: string]
}>()
</script>

<template>
  <ul class="list">
    <TraceRow
      v-for="group in groups"
      :key="group.traceId"
      :group="group"
      :active="group.traceId === activeId"
      @select="$emit('select', $event)"
    />
  </ul>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
</style>
