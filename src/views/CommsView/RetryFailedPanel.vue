<script setup lang="ts">
import { onMounted } from 'vue'
import { apiForceDispatch } from '@/stores/dispatch-api'
import { apiListFailedRecipients } from '@/stores/runs-api'
import { useRetryFailed } from './use-retry-failed'

const emit = defineEmits<{ dispatched: [] }>()

const s = useRetryFailed({
  list: apiListFailedRecipients,
  dispatch: apiForceDispatch,
  onDone: () => emit('dispatched'),
})

onMounted(() => {
  void s.load()
})
</script>

<template>
  <section class="retry" data-testid="retry-failed">
    <p class="lead">
      Re-sends only to addresses whose <strong>most recent attempt
      failed</strong>. A successful send drops an address out of this set,
      so pressing this twice cannot deliver the same digest twice. Each
      recipient gets exactly what they missed — the digest is measured
      against their own last-sent stamp, not the list's.
    </p>

    <p v-if="s.loading.value" class="msg" role="status">Loading…</p>
    <p v-else-if="s.error.value" class="msg err" role="alert">
      {{ s.error.value }}
    </p>
    <p
      v-else-if="s.recipients.value.length === 0"
      class="msg"
      role="status"
      data-testid="retry-failed-empty"
    >
      Nothing to re-send — no address is in a failed state.
    </p>

    <ul v-else class="rows" data-testid="retry-failed-list">
      <li
        v-for="r in s.recipients.value"
        :key="r.id"
        class="row"
        data-testid="retry-failed-row"
      >
        <span class="email">{{ r.email }}</span>
        <span class="err-text">{{ r.error ?? 'unknown error' }}</span>
      </li>
    </ul>

    <button
      v-if="s.recipients.value.length > 0 && s.phase.value === 'idle'"
      type="button"
      class="go"
      data-testid="retry-failed-start"
      @click="s.ask"
    >
      Re-send to {{ s.recipients.value.length }} failed
    </button>

    <div v-if="s.phase.value === 'confirm'" class="confirm" role="alertdialog">
      <p>
        Send the digest to
        <strong>{{ s.recipients.value.length }}</strong> address(es)? Real
        email goes out immediately.
      </p>
      <button
        type="button"
        class="go"
        data-testid="retry-failed-confirm"
        @click="s.run"
      >
        Yes, send
      </button>
      <button type="button" class="cancel" data-testid="retry-failed-cancel" @click="s.cancel">
        Cancel
      </button>
    </div>

    <p v-if="s.phase.value === 'sending'" class="msg" role="status">Sending…</p>
    <p
      v-if="s.phase.value === 'done' && s.result.value"
      class="msg ok"
      role="status"
      data-testid="retry-failed-result"
    >
      Sent {{ s.result.value.sent }}, failed {{ s.result.value.failed }},
      skipped {{ s.result.value.skipped }}. Check the log below and the report
      email.
    </p>
  </section>
</template>

<style scoped>
.retry {
  display: grid;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.lead {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.msg {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.msg.err {
  color: var(--color-danger);
}

.msg.ok {
  color: var(--color-text-primary);
}

.rows {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.15rem;
  max-height: 14rem;
  overflow-y: auto;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  font-size: 0.8125rem;
}

.email {
  font-family: var(--font-mono);
}

.err-text {
  color: var(--color-danger);
  font-family: var(--font-mono);
}

.go,
.cancel {
  justify-self: start;
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.go:hover,
.cancel:hover {
  background: var(--color-surface-hover);
}

.confirm {
  display: grid;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-left: 3px solid var(--color-danger);
}

.confirm p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
