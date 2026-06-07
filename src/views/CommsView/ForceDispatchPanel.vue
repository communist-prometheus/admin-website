<script setup lang="ts">
import { ref } from 'vue'
import {
  apiForceDispatch,
  type ForceDispatchResult,
} from '@/stores/dispatch-api'

const props = defineProps<{
  readonly activeCount: number
}>()

const emit = defineEmits<{
  dispatched: []
}>()

type Phase = 'idle' | 'confirm' | 'sending' | 'done' | 'error'

const phase = ref<Phase>('idle')
const result = ref<ForceDispatchResult | undefined>(undefined)
const error = ref<string | undefined>(undefined)

const ask = (): void => {
  phase.value = 'confirm'
}

const cancel = (): void => {
  phase.value = 'idle'
}

const confirm = async (): Promise<void> => {
  phase.value = 'sending'
  error.value = undefined
  try {
    result.value = await apiForceDispatch()
    phase.value = 'done'
    emit('dispatched')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Dispatch failed'
    phase.value = 'error'
  }
}

const reset = (): void => {
  phase.value = 'idle'
  result.value = undefined
  error.value = undefined
}
</script>

<template>
  <div
    class="force-dispatch"
    data-testid="force-dispatch-panel"
    aria-labelledby="force-dispatch-title"
  >
    <p id="force-dispatch-title" class="lead">
      Trigger an immediate send to every active subscriber. The
      saved schedule is <strong>not</strong> changed — the next
      cron tick still fires at its regular time.
    </p>

    <button
      v-if="phase === 'idle'"
      type="button"
      class="btn btn-trigger"
      data-testid="force-dispatch-start"
      :disabled="activeCount === 0"
      @click="ask"
    >
      Send test dispatch now
    </button>

    <div
      v-else-if="phase === 'confirm'"
      class="confirm"
      role="alertdialog"
      aria-labelledby="force-confirm-warning"
    >
      <p id="force-confirm-warning" class="warning">
        ⚠ This sends the current digest to
        <strong>{{ activeCount }}</strong>
        active subscriber<span v-if="activeCount !== 1">s</span>
        right now and writes a row per recipient to the run log.
      </p>
      <div class="confirm-actions">
        <button
          type="button"
          class="btn btn-cancel"
          data-testid="force-dispatch-cancel"
          @click="cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-confirm"
          data-testid="force-dispatch-confirm"
          @click="confirm"
        >
          Yes, send now
        </button>
      </div>
    </div>

    <p
      v-else-if="phase === 'sending'"
      class="status"
      role="status"
      data-testid="force-dispatch-sending"
    >
      Dispatching…
    </p>

    <div
      v-else-if="phase === 'done' && result"
      class="result"
      role="status"
      data-testid="force-dispatch-result"
    >
      <p>
        <strong>Sent {{ result.sent }}</strong> ·
        failed {{ result.failed }} ·
        skipped {{ result.skipped }} ·
        {{ result.durationMs }}ms.
      </p>
      <button
        type="button"
        class="btn btn-ghost"
        data-testid="force-dispatch-reset"
        @click="reset"
      >
        Reset
      </button>
    </div>

    <div
      v-else-if="phase === 'error'"
      class="error"
      role="alert"
      data-testid="force-dispatch-error"
    >
      <p>{{ error }}</p>
      <button
        type="button"
        class="btn btn-ghost"
        data-testid="force-dispatch-error-reset"
        @click="reset"
      >
        Reset
      </button>
    </div>
  </div>
</template>

<style scoped>
.force-dispatch {
  display: grid;
  gap: var(--spacing-sm);
}

.lead {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font: 600 0.95rem/1 var(--font-sans);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
  border: 1px solid transparent;
}

.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.btn-trigger {
  justify-self: start;
  background: var(--color-warning);
  color: var(--color-background);
  border-color: var(--color-warning);
}

.btn-trigger:hover:not(:disabled) {
  filter: brightness(1.08);
}

.confirm {
  border: 1px solid var(--color-warning);
  background: var(--color-danger-subtle);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  display: grid;
  gap: var(--spacing-sm);
}

.warning {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  line-height: 1.4;
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.btn-cancel {
  background: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn-cancel:hover {
  border-color: var(--color-text-secondary);
}

.btn-confirm {
  background: var(--color-danger);
  color: var(--color-background);
  border-color: var(--color-danger);
}

.btn-confirm:hover {
  filter: brightness(1.08);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
  padding: 0.4rem 0.85rem;
  font-size: 0.8125rem;
  justify-self: start;
}

.btn-ghost:hover {
  border-color: var(--color-text-secondary);
}

.status {
  margin: 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.result {
  display: grid;
  gap: var(--spacing-xs);
}

.result p {
  margin: 0;
  color: var(--color-success);
  font-size: 0.9375rem;
}

.error {
  display: grid;
  gap: var(--spacing-xs);
}

.error p {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.9375rem;
}

@media (width < 640px) {
  .btn-trigger,
  .btn-cancel,
  .btn-confirm {
    justify-self: stretch;
    width: 100%;
  }

  .confirm-actions {
    flex-direction: column;
  }
}
</style>
