<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  readonly at: string | null
  readonly saving?: boolean
  readonly error?: string
}>()

const emit = defineEmits<{
  save: [next: string | null]
}>()

// `<input type="datetime-local">` wants the local-time format
// `YYYY-MM-DDTHH:mm` (no seconds, no timezone). We round-trip via
// UTC ISO so the model stays canonical.
const isoToLocal = (iso: string): string => {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return [
    d.getFullYear(),
    '-',
    pad(d.getMonth() + 1),
    '-',
    pad(d.getDate()),
    'T',
    pad(d.getHours()),
    ':',
    pad(d.getMinutes()),
  ].join('')
}

const localToIso = (local: string): string =>
  local === '' ? '' : new Date(local).toISOString()

const draft = ref<string>(props.at ? isoToLocal(props.at) : '')

watch(
  () => props.at,
  next => {
    draft.value = next ? isoToLocal(next) : ''
  }
)

const isDirty = computed(() => {
  const fromInput = draft.value === '' ? null : localToIso(draft.value)
  return fromInput !== props.at
})

const onSubmit = (): void => {
  emit('save', draft.value === '' ? null : localToIso(draft.value))
}

const onClear = (): void => {
  draft.value = ''
  emit('save', null)
}

const display = computed(() => (props.at === null ? '—' : props.at))
</script>

<template>
  <form
    class="cutoff"
    data-testid="cutoff-editor"
    aria-labelledby="cutoff-title"
    @submit.prevent="onSubmit"
  >
    <span id="cutoff-title" class="sr-only">Cutoff watermark</span>
    <label class="field">
      <span class="field-label">Last run at (local time)</span>
      <input
        v-model="draft"
        type="datetime-local"
        class="field-input"
        data-testid="cutoff-input"
        :disabled="saving"
      />
    </label>
    <p class="current" data-testid="cutoff-current">
      Stored value (UTC): <code>{{ display }}</code>
    </p>
    <div class="actions">
      <button
        type="submit"
        class="btn btn-primary"
        data-testid="cutoff-save"
        :disabled="saving || !isDirty"
      >
        {{ saving ? 'Saving…' : 'Save cutoff' }}
      </button>
      <button
        v-if="at !== null"
        type="button"
        class="btn btn-ghost"
        data-testid="cutoff-clear"
        :disabled="saving"
        @click="onClear"
      >
        Reset to none
      </button>
    </div>
    <p
      v-if="error"
      class="error"
      data-testid="cutoff-error"
    >{{ error }}</p>
  </form>
</template>

<style scoped>
.cutoff {
  display: grid;
  gap: var(--spacing-sm);
}

.field {
  display: grid;
  gap: 0.25rem;
}

.field-label {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.field-input {
  appearance: none;
  width: 100%;
  padding: 0.55rem 0.85rem;
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: 400 0.95rem/1.4 var(--font-mono);
  transition: border-color var(--transition-fast);
}

.field-input:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-color: var(--color-focus-ring);
}

.current {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.current code {
  font-family: var(--font-mono);
}

.actions {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font: 600 0.95rem/1 var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-background);
  border-color: var(--color-accent);
}

.btn-primary:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: var(--color-border);
  padding: 0.55rem 0.85rem;
  font-size: 0.875rem;
}

.btn-ghost:hover:not(:disabled) {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}

.error {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.8125rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

@media (width < 640px) {
  .btn-primary,
  .btn-ghost {
    width: 100%;
  }
}
</style>
