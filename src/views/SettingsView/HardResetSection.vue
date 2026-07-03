<script setup lang="ts">
import { ref } from 'vue'
import { useHardReset } from '@/composables/useHardReset'
import HardResetConfirmDialog from './HardResetConfirmDialog.vue'
import HardResetProgressBar from './HardResetProgressBar.vue'

const { running, progress, error, start } = useHardReset()

const confirming = ref(false)

const onOpenConfirm = (): void => {
  confirming.value = true
}
const onCancel = (): void => {
  confirming.value = false
}
const onConfirm = (): void => {
  confirming.value = false
  void start()
}
</script>

<template>
  <section
    class="hard-reset-section danger-zone"
    data-testid="hard-reset-section"
  >
    <h2>Reset local data</h2>
    <p class="section-hint">
      Wipes every cached asset the admin app writes on this device — the
      cloned Git repository, HTTP caches, IndexedDB databases, local storage,
      and the service worker — then reloads with a fresh copy. You will be
      signed out and need to log in again.
    </p>
    <button
      v-if="!running"
      type="button"
      class="btn-danger"
      data-testid="hard-reset-open"
      :disabled="confirming"
      @click="onOpenConfirm"
    >
      Full reset
    </button>
    <p
      v-if="error"
      class="error-hint"
      data-testid="hard-reset-error"
    >
      {{ error }}
    </p>
    <HardResetProgressBar v-if="running && progress" :progress="progress" />
    <HardResetConfirmDialog
      v-if="confirming"
      @cancel="onCancel"
      @confirm="onConfirm"
    />
  </section>
</template>

<style scoped>
.hard-reset-section {
  padding: 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  display: grid;
  gap: 0.75rem;
}

.danger-zone {
  border-color: color-mix(in srgb, var(--color-error, #e53935) 45%, var(--color-border));
}

.hard-reset-section h2 {
  margin: 0;
  font-size: 1rem;
  color: var(--color-error, #e53935);
}

.section-hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.5;
}

.btn-danger {
  justify-self: start;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--color-error, #e53935);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-error, #e53935);
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-danger:hover,
.btn-danger:focus-visible {
  background: color-mix(in srgb, var(--color-error, #e53935) 12%, transparent);
}

.btn-danger:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.error-hint {
  margin: 0;
  color: var(--color-error, #e53935);
  font-size: 0.85rem;
}
</style>
