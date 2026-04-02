<script setup lang="ts">
import type { CheckRun } from '@/composables/useDeployStatus/check-runs'

defineProps<{
  readonly check: CheckRun
  readonly sha: string
}>()

const fmt = (iso: string | undefined) =>
  iso ? new Date(iso).toLocaleString() : '—'
</script>

<template>
  <p class="row">Commit: <code>{{ sha }}</code></p>
  <p class="row">Started: {{ fmt(check.started_at) }}</p>
  <p class="row">Finished: {{ fmt(check.completed_at) }}</p>
  <p v-if="check.details_url" class="row">
    <a :href="check.details_url" target="_blank">View in Cloudflare</a>
  </p>
</template>

<style scoped>
.row {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0.125rem 0;
}

.row code {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--color-text-primary);
}

.row a {
  color: var(--color-primary);
  text-decoration: none;
}
</style>
