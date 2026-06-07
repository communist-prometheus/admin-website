<script setup lang="ts">
import type { RunLog } from '@/stores/runs'
import RunHistoryRow from './RunHistoryRow.vue'

defineProps<{ readonly runs: readonly RunLog[] }>()
</script>

<template>
  <table class="rows" data-testid="run-history-list">
    <thead>
      <tr>
        <th scope="col" class="th-tick">Tick (UTC)</th>
        <th scope="col" class="th-email">Email</th>
        <th scope="col" class="th-status">Status</th>
        <th scope="col" class="th-count">Articles</th>
      </tr>
    </thead>
    <tbody>
      <RunHistoryRow v-for="run in runs" :key="run.id" :run="run" />
    </tbody>
  </table>
</template>

<style scoped>
.rows {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.rows th {
  padding: var(--spacing-xs);
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--color-border);
}

.th-tick {
  width: 11rem;
  font-family: var(--font-mono);
}

.th-email {
  width: auto;
}

.th-status {
  width: 8rem;
}

.th-count {
  width: 5rem;
  text-align: right;
}

@media (width < 640px) {
  .rows,
  .rows thead,
  .rows tbody {
    display: block;
  }

  .rows thead {
    display: none;
  }
}
</style>
