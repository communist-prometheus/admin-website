<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { apiListSubscriberRuns } from '@/stores/runs-api'
import type { RunLog } from '@/validation/schemas/run-log'
import { shortTickAt, statusBadgeClass } from './run-history-ops'

const props = defineProps<{ readonly subscriberId: number }>()

const runs = ref<readonly RunLog[]>([])
const loading = ref(true)
const error = ref<string | undefined>(undefined)

onMounted(async () => {
  try {
    const res = await apiListSubscriberRuns(props.subscriberId)
    runs.value = res.runs
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load history'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="history" data-testid="subscriber-history">
    <p v-if="error" class="msg" role="alert">{{ error }}</p>
    <p v-else-if="loading" class="msg" role="status">Loading history…</p>
    <p
      v-else-if="runs.length === 0"
      class="msg"
      role="status"
      data-testid="subscriber-history-empty"
    >
      Nothing has been sent to this address yet.
    </p>
    <ul v-else class="rows">
      <li
        v-for="run in runs"
        :key="run.id"
        class="row"
        data-testid="subscriber-history-row"
      >
        <span class="when">{{ shortTickAt(run.tickAt) }}</span>
        <span class="badge" :class="statusBadgeClass(run.status)">
          {{ run.status }}
        </span>
        <span class="count">{{ run.articleCount }} article(s)</span>
        <span v-if="run.error" class="err">{{ run.error }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.history {
  padding: var(--spacing-sm) 0 var(--spacing-sm) var(--spacing-md);
  border-left: 2px solid var(--color-border);
}

.msg {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--spacing-sm);
  font-size: 0.8125rem;
}

.when {
  font-family: var(--font-mono);
  color: var(--color-text-secondary);
}

.badge {
  padding: 0 0.4rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.count {
  color: var(--color-text-secondary);
}

.err {
  color: var(--color-danger);
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}
</style>
