<script setup lang="ts">
import type { RunLog } from '@/stores/runs'
import RunHistoryList from './RunHistoryList.vue'

defineProps<{
  readonly runs: readonly RunLog[]
  readonly loading: boolean
  readonly error: string | undefined
}>()
</script>

<template>
  <section class="history" data-testid="run-history">
    <h2 class="title">Run history</h2>
    <p
      v-if="error"
      class="error"
      data-testid="run-history-error"
    >{{ error }}</p>
    <p
      v-else-if="loading && runs.length === 0"
      data-testid="run-history-loading"
    >Loading…</p>
    <p
      v-else-if="!loading && runs.length === 0"
      class="empty"
      data-testid="run-history-empty"
    >No newsletter runs have been recorded yet.</p>
    <RunHistoryList v-else :runs="runs" />
  </section>
</template>

<style scoped>
.history {
  padding: 1rem 0 0;
  border-top: 1px solid var(--color-border);
}

.title {
  margin: 0 0 0.6rem;
  font-size: 1rem;
  font-weight: 700;
}

.error {
  color: var(--color-danger, #c0392b);
  font-size: 0.8125rem;
}

.empty {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  margin: 0;
}
</style>
