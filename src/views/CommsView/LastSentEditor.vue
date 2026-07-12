<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Subscriber } from '@/stores/comms'

const props = defineProps<{ readonly entry: Subscriber }>()
const emit = defineEmits<{ save: [id: number, lastSentAt: string | null] }>()

/*
 * `last_sent_at` is this address's own "what is new" boundary: dispatch
 * only mails articles published after it. Winding it back replays a
 * digest for this address alone — nobody else on the list is dragged
 * back with it, which is what the old shared cutoff would have done.
 *
 * <input type="datetime-local"> speaks local time without a zone, so
 * convert on the way in and out; the API stores ISO-8601 UTC.
 */
const toLocalInput = (iso: string | undefined): string => {
  const ms = iso === undefined ? Number.NaN : Date.parse(iso)
  if (!Number.isFinite(ms)) return ''
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60_000)
  return d.toISOString().slice(0, 16)
}

const draft = ref(toLocalInput(props.entry.lastSentAt))

const dirty = computed(() => draft.value !== toLocalInput(props.entry.lastSentAt))

const onSave = (): void => {
  const ms = Date.parse(draft.value)
  emit(
    'save',
    props.entry.id,
    Number.isFinite(ms) ? new Date(ms).toISOString() : null
  )
}
</script>

<template>
  <form class="editor" data-testid="last-sent-editor" @submit.prevent="onSave">
    <label class="label" :for="`last-sent-${entry.id}`">
      Last sent — articles newer than this get mailed
    </label>
    <input
      :id="`last-sent-${entry.id}`"
      v-model="draft"
      type="datetime-local"
      class="input"
      data-testid="last-sent-input"
    />
    <button
      type="submit"
      class="save"
      data-testid="last-sent-save"
      :disabled="!dirty"
    >
      Save
    </button>
  </form>
</template>

<style scoped>
.editor {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
  padding-block-end: var(--spacing-sm);
}

.label {
  flex-basis: 100%;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.input {
  padding: 0.25rem 0.4rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.save {
  padding: 0.25rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 0.8125rem;
  cursor: pointer;
}

.save:disabled {
  opacity: 50%;
  cursor: default;
}

.save:hover:not(:disabled) {
  background: var(--color-surface-hover);
}
</style>
