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

const submit = (): void => emit('save', { ...draft.value })
</script>

<template>
  <form class="editor" data-testid="schedule-editor" @submit.prevent="submit">
    <input
      v-model="draft.cron"
      type="text"
      class="cron"
      data-testid="schedule-cron"
      aria-label="Crontab expression"
      placeholder="0 12 * * 6"
      autocomplete="off"
      spellcheck="false"
      :disabled="saving"
    />
    <TimezoneSelect v-model="draft.timezone" :disabled="saving" />
    <p class="preview" data-testid="schedule-preview">{{ preview }}</p>
    <p class="next" data-testid="schedule-next-run">
      Next run: {{ props.schedule?.nextRunAt ?? '—' }}
    </p>
    <button
      type="submit"
      class="save"
      data-testid="schedule-save"
      :disabled="!canSave"
    >
      {{ saving ? 'Saving…' : 'Save schedule' }}
    </button>
    <p v-if="error" class="error" data-testid="schedule-error">{{ error }}</p>
  </form>
</template>

<style scoped>
.editor {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.55rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-border);
}

.cron {
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: var(--font-mono, monospace);
}

.preview {
  margin: 0.3rem 0 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.next {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  font-family: var(--font-mono, monospace);
}

.save {
  justify-self: start;
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-background);
  font-weight: 700;
  cursor: pointer;
}

.save:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.error {
  margin: 0;
  color: var(--color-danger, #c0392b);
  font-size: 0.8125rem;
}
</style>
