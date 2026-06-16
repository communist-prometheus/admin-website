<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Lang } from '@/stores/comms'
import { canSubmitNewSubscriber } from './draft-ops'
import LangTogglePills from './LangTogglePills.vue'

const props = defineProps<{ readonly saving?: boolean }>()
const emit = defineEmits<{
  add: [email: string, langs: readonly Lang[]]
}>()

const email = ref('')
const langs = ref<readonly Lang[]>([])
const error = ref<string | undefined>(undefined)
const announce = ref<string>('')

const setLangs = (next: readonly Lang[]): void => {
  langs.value = next
}

const isInvalid = computed(() => error.value !== undefined)

const submit = async (): Promise<void> => {
  if (!canSubmitNewSubscriber(email.value, langs.value)) return
  error.value = undefined
  try {
    emit('add', email.value.trim(), langs.value)
    announce.value = `Subscriber ${email.value.trim()} added.`
    email.value = ''
    langs.value = []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to add'
    announce.value = `Failed to add subscriber: ${error.value}`
  }
}
</script>

<template>
  <form
    class="add-form"
    data-testid="add-subscriber-form"
    aria-labelledby="add-form-title"
    @submit.prevent="submit"
  >
    <span id="add-form-title" class="sr-only">Add subscriber</span>
    <label class="field">
      <span class="field-label">Email</span>
      <input
        v-model="email"
        type="email"
        class="field-input"
        placeholder="recipient@example.org"
        data-testid="add-subscriber-email"
        :disabled="saving"
        :aria-invalid="isInvalid || undefined"
        :aria-describedby="isInvalid ? 'add-subscriber-error' : undefined"
        required
      />
    </label>
    <label class="field">
      <span class="field-label">Languages</span>
      <LangTogglePills :langs="langs" :disabled="saving" @change="setLangs" />
    </label>
    <button
      type="submit"
      class="btn btn-primary submit"
      data-testid="add-subscriber-submit"
      :disabled="saving || !canSubmitNewSubscriber(email, langs)"
    >
      {{ saving ? 'Adding…' : 'Add subscriber' }}
    </button>
    <p
      v-if="error"
      id="add-subscriber-error"
      class="error"
      data-testid="add-subscriber-error"
    >{{ error }}</p>
    <output
      class="sr-only"
      role="status"
      aria-live="polite"
      data-testid="add-subscriber-announce"
    >{{ announce }}</output>
  </form>
</template>

<style scoped>
.add-form {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: var(--spacing-sm);
  align-items: end;
}

@media (width < 640px) {
  .add-form {
    grid-template-columns: 1fr;
    align-items: stretch;
  }

  .add-form .submit {
    justify-content: center;
  }
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
  min-width: 0;
  box-sizing: border-box;
  padding: 0.55rem 0.85rem;
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: 400 0.95rem/1.4 var(--font-sans);
  transition: border-color var(--transition-fast);
}

.field-input:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-color: var(--color-focus-ring);
}

.field-input:hover:not(:disabled) {
  border-color: var(--color-text-secondary);
}

.field-input[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font: 600 0.95rem/1 var(--font-sans);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-background);
  border: 1px solid var(--color-accent);
}

.btn-primary:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.error {
  grid-column: 1 / -1;
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
</style>
