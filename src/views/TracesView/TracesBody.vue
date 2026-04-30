<script setup lang="ts">
import type { DetailError, TraceDetailBody } from '@/composables/useTraceDetail/detail-types'
import type { TraceSummary } from '@/composables/useTraceSearch/search-types'
import DetailPanel from './DetailPanel.vue'
import ResultsTable from './ResultsTable.vue'

defineProps<{
  readonly traces: ReadonlyArray<TraceSummary>
  readonly activeId: string | undefined
  readonly searchLoading: boolean
  readonly hasMore: boolean
  readonly detail: TraceDetailBody | undefined
  readonly detailLoading: boolean
  readonly detailError: DetailError
}>()

defineEmits<{
  readonly select: [traceId: string]
  readonly loadMore: []
}>()
</script>

<template>
  <section class="body">
    <ResultsTable
      :traces="traces"
      :active-id="activeId"
      :loading="searchLoading"
      :has-more="hasMore"
      @select="$emit('select', $event)"
      @load-more="$emit('loadMore')"
    />
    <DetailPanel
      :detail="detail"
      :loading="detailLoading"
      :error="detailError"
    />
  </section>
</template>

<style scoped>
.body {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0;
  flex: 1;
  overflow: auto;
}
</style>
