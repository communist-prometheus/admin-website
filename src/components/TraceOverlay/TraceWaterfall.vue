<script setup lang="ts">
import { computed } from 'vue'
import type { Span } from '@/composables/useTracing'
import SpanBar from './SpanBar.vue'

const props = defineProps<{
  readonly spans: ReadonlyArray<Span>
}>()

const range = computed(() => {
  const starts = props.spans.map(s => s.startedAt)
  const ends = props.spans.map(s => s.finishedAt ?? s.startedAt)
  const min = Math.min(...starts, 0)
  const max = Math.max(...ends, min + 1)
  return { min, span: max - min }
})

const widthOf = (s: Span): string => {
  const dur = (s.finishedAt ?? s.startedAt) - s.startedAt
  const pct = (dur / Math.max(range.value.span, 1)) * 100
  return `${Math.max(2, pct)}%`
}

const offsetOf = (s: Span): string => {
  const off = s.startedAt - range.value.min
  const pct = (off / Math.max(range.value.span, 1)) * 100
  return `${pct}%`
}
</script>

<template>
  <ol class="waterfall">
    <SpanBar
      v-for="s in spans"
      :key="s.id"
      :span="s"
      :offset="offsetOf(s)"
      :width="widthOf(s)"
    />
  </ol>
</template>

<style scoped>
.waterfall {
  list-style: none;
  margin: 0;
  padding: 6px 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
</style>
