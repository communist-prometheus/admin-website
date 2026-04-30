<script setup lang="ts">
import type { TraceGroup } from '@/components/TraceOverlay/group-by-trace'
import TraceList from '@/components/TraceOverlay/TraceList.vue'
import TraceWaterfall from '@/components/TraceOverlay/TraceWaterfall.vue'
import type { Span } from '@/composables/useTracing/span-types'

defineProps<{
  readonly groups: ReadonlyArray<TraceGroup>
  readonly activeId: string | undefined
  readonly activeSpans: ReadonlyArray<Span>
}>()

defineEmits<{
  readonly select: [traceId: string]
}>()
</script>

<template>
  <section class="body">
    <TraceList
      :groups="groups"
      :active-id="activeId"
      @select="$emit('select', $event)"
    />
    <TraceWaterfall :spans="activeSpans" />
  </section>
</template>

<style scoped>
.body {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) 2fr;
  gap: 1rem;
  padding: 1rem;
  flex: 1;
  overflow: auto;
}
</style>
