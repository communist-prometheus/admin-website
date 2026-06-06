<script setup lang="ts">
import type { RunLog } from '@/stores/runs'
import RunHistoryRow from './RunHistoryRow.vue'

defineProps<{ readonly runs: readonly RunLog[] }>()
</script>

<template>
  <ol class="rows" data-testid="run-history-list">
    <RunHistoryRow
      v-for="run in runs"
      :key="run.id"
      :run="run"
      data-testid="run-history-row"
    />
  </ol>
</template>

<style scoped>
.rows {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
