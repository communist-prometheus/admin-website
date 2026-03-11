<script setup lang="ts">
import { computed } from 'vue'
import type { SWMetricsResponse } from '@/sw/protocol'
import { formatUptime } from './format-uptime'
import SWMetricsSummary from './SWMetricsSummary.vue'
import SWOpsList from './SWOpsList.vue'

const props = defineProps<{
  readonly metrics: SWMetricsResponse | undefined
}>()

const uptime = computed(() =>
  props.metrics ? formatUptime(props.metrics.uptime) : '—'
)

const cacheRatio = computed(() => {
  if (!props.metrics) return '—'
  const { hits, misses } = props.metrics.cache
  const total = hits + misses
  if (total === 0) return 'no requests'
  const pct = Math.round((hits / total) * 100)
  return `${hits}/${total} (${pct}%)`
})

const opEntries = computed(() => {
  if (!props.metrics) return []
  return Object.entries(props.metrics.ops)
    .map(([name, s]) => ({
      name,
      count: s.count,
      avg: Math.round(s.totalMs / s.count),
      total: Math.round(s.totalMs),
    }))
    .sort((a, b) => b.total - a.total)
})
</script>

<template>
  <section
    v-if="metrics"
    class="sw-metrics"
    data-testid="sw-metrics"
  >
    <SWMetricsSummary
      :uptime="uptime"
      :cache-ratio="cacheRatio"
    />
    <SWOpsList v-if="opEntries.length" :ops="opEntries" />
  </section>
</template>

<style scoped>
.sw-metrics {
  padding: 0.5em 1em;
  overflow-y: auto;
  flex: 1;
}
</style>
