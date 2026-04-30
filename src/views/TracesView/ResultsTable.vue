<script setup lang="ts">
import type { TraceSummary } from '@/composables/useTraceSearch/search-types'

defineProps<{
  readonly traces: ReadonlyArray<TraceSummary>
  readonly activeId: string | undefined
  readonly loading: boolean
  readonly hasMore: boolean
}>()

defineEmits<{
  readonly select: [traceId: string]
  readonly loadMore: []
}>()

const fmtTime = (ms: number): string =>
  new Date(ms).toLocaleString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
</script>

<template>
  <div class="results">
    <table>
      <thead>
        <tr>
          <th>Started</th>
          <th>Trace</th>
          <th>Status</th>
          <th>Spans</th>
          <th>Duration</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="t in traces"
          :key="t.traceId"
          :data-testid="`result-row-${t.traceId}`"
          :class="{ active: t.traceId === activeId }"
          @click="$emit('select', t.traceId)"
        >
          <td>{{ fmtTime(t.startedAt) }}</td>
          <td class="mono">{{ t.rootName }}</td>
          <td>{{ t.status }}</td>
          <td>{{ t.spanCount }}</td>
          <td>{{ t.durationMs }}ms</td>
        </tr>
      </tbody>
    </table>
    <button
      v-if="hasMore"
      type="button"
      class="load-more"
      data-testid="load-more-button"
      :disabled="loading"
      @click="$emit('loadMore')"
    >
      Load more
    </button>
  </div>
</template>

<style scoped>
.results {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th,
td {
  padding: 0.4rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
}

tbody tr {
  cursor: pointer;
}

tbody tr:hover {
  background: var(--color-background-soft);
}

tbody .active {
  background: var(--color-border-hover);
}

.mono {
  font-family: var(--font-mono, monospace);
}

.load-more {
  align-self: center;
  margin: 1rem 0;
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  cursor: pointer;
}
</style>
