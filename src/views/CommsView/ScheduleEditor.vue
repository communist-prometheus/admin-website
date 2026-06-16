<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type {
  Schedule,
  ScheduleWithNext,
} from '@/validation/schemas/schedule'
import { humaniseCron } from './humanise-cron'
import {
  canSubmitSchedule,
  hasChanged,
  initialDraft,
} from './schedule-draft-ops'
import TimezoneSelect from './TimezoneSelect.vue'

const props = defineProps<{
  readonly schedule: ScheduleWithNext | undefined
  readonly saving: boolean
  readonly error: string | undefined
}>()

const emit = defineEmits<{
  save: [next: Schedule]
}>()

const draft = ref<Schedule>(initialDraft(props.schedule))

watch(
  () => props.schedule,
  next => {
    draft.value = initialDraft(next)
  }
)

const preview = computed(
  () => `${humaniseCron(draft.value.cron)} (${draft.value.timezone})`
)

const canSave = computed(
  () =>
    canSubmitSchedule(draft.value) &&
    hasChanged(draft.value, props.schedule) &&
    !props.saving
)

const isInvalid = computed(() => props.error !== undefined)

const submit = (): void => emit('save', { ...draft.value })
</script>

<template>
  <form class="editor" data-testid="schedule-editor" @submit.prevent="submit">
    <label class="field">
      <span class="field-label">Crontab expression</span>
      <input
        v-model="draft.cron"
        type="text"
        class="field-input cron"
        data-testid="schedule-cron"
        placeholder="0 12 * * 6"
        autocomplete="off"
        spellcheck="false"
        :disabled="saving"
        :aria-invalid="isInvalid || undefined"
        :aria-describedby="isInvalid ? 'schedule-error-msg' : undefined"
      />
    </label>
    <TimezoneSelect v-model="draft.timezone" :disabled="saving" />
    <p class="preview" data-testid="schedule-preview">{{ preview }}</p>
    <p class="next" data-testid="schedule-next-run">
      Next run: {{ props.schedule?.nextRunAt ?? '—' }}
    </p>
    <button
      type="submit"
      class="btn save"
      data-testid="schedule-save"
      :disabled="!canSave"
    >
      {{ saving ? 'Saving…' : 'Save schedule' }}
    </button>
    <p
      v-if="error"
      id="schedule-error-msg"
      class="error"
      data-testid="schedule-error"
    >{{ error }}</p>
  </form>
</template>

<style scoped>
.editor {
  display: grid;
  grid-template-columns: 1fr;
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

.field-input[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.cron {
  font-family: var(--font-mono);
  font-size: 0.95rem;
}

.preview {
  margin: 0.25rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.next {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  font-family: var(--font-mono);
}

.btn {
  justify-self: start;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font: 600 0.95rem/1 var(--font-sans);
  cursor: pointer;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.save {
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-background);
}

.save:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.save:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.save:hover:not(:disabled) {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.error {
  margin: 0;
  color: var(--color-danger);
  font-size: 0.8125rem;
}

@media (width < 640px) {
  .btn.save {
    justify-self: stretch;
    text-align: center;
    justify-content: center;
  }
}
</style>
