<script setup lang="ts">
import { ref } from 'vue'
import { clearHistory } from '@/features/action-history/recorder'

const status = ref<'idle' | 'cleared' | 'error'>('idle')

const onClear = async (): Promise<void> => {
  try {
    await clearHistory()
    status.value = 'cleared'
  } catch {
    status.value = 'error'
  }
}
</script>

<template>
  <section class="ah-section">
    <h2>Action History</h2>
    <p class="lead">
      A short rolling window of your recent actions (routes, saves,
      auth changes, errors) is kept on this device so that ticket
      reports include context. No file contents are recorded.
    </p>
    <button
      type="button"
      class="clear-btn"
      data-testid="clear-action-history"
      @click="onClear"
    >
      Clear my action history
    </button>
    <p
      v-if="status === 'cleared'"
      class="ok"
      data-testid="clear-action-history-status"
    >
      History cleared.
    </p>
    <p v-else-if="status === 'error'" class="err">
      Failed to clear history. Try again.
    </p>
  </section>
</template>

<style scoped>
.ah-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.lead {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.clear-btn {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
}

.ok {
  color: var(--color-success, #1a7f37);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}

.err {
  color: var(--color-danger, #d73a4a);
  font-size: 0.8125rem;
  margin-top: 0.5rem;
}
</style>
