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
  <div class="history" data-testid="run-history">
    <p
      v-if="error"
      class="error"
      role="alert"
      data-testid="run-history-error"
    >{{ error }}</p>
    <p
      v-else-if="loading && runs.length === 0"
      class="status"
      role="status"
      data-testid="run-history-loading"
    >Loading…</p>
    <p
      v-else-if="!loading && runs.length === 0"
      class="status"
      role="status"
      data-testid="run-history-empty"
    >No newsletter runs have been recorded yet.</p>
    <RunHistoryList v-else :runs="runs" />
  </div>
</template>

<style scoped>
.history {
  min-height: 8rem;
}

.error {
  color: var(--color-danger);
  font-size: 0.8125rem;
  margin: 0;
}

.status {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  margin: 0;
}
</style>
