<script setup lang="ts">
import { computed } from 'vue'
import TraceWaterfall from '@/components/TraceOverlay/TraceWaterfall.vue'
import type { DetailError, TraceDetailBody } from '@/composables/useTraceDetail/detail-types'
import { remoteToSpan } from '@/composables/useTracing/remote-to-span'

const props = defineProps<{
  readonly detail: TraceDetailBody | undefined
  readonly loading: boolean
  readonly error: DetailError
}>()

const localSpans = computed(() =>
  (props.detail?.spans ?? []).map(remoteToSpan)
)
</script>

<template>
  <aside class="detail">
    <p v-if="loading" class="banner">Loading…</p>
    <p v-else-if="error === 'forbidden'" class="banner err">
      You are not allowed to see this trace.
    </p>
    <p v-else-if="error === 'not-found'" class="banner err">
      Trace not found.
    </p>
    <p v-else-if="error === 'unknown'" class="banner err">
      Failed to load trace.
    </p>
    <p v-else-if="!detail" class="banner muted">
      Pick a row to inspect a trace.
    </p>
    <TraceWaterfall v-else :spans="localSpans" />
  </aside>
</template>

<style scoped>
.detail {
  border-left: 1px solid var(--color-border);
  padding: 1rem;
  overflow: auto;
  min-width: 320px;
}

.banner {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  background: var(--color-background-soft);
  font-size: 0.875rem;
}

.banner.muted {
  color: var(--color-text-secondary);
}

.banner.err {
  background: hsl(0deg 50% 30% / 25%);
}
</style>
