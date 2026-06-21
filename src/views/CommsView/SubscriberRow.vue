<script setup lang="ts">
import type { Lang, Subscriber } from '@/stores/comms'
import LangTogglePills from './LangTogglePills.vue'
import MessageLangSelect from './MessageLangSelect.vue'
import SubscriberStatusBadge from './SubscriberStatusBadge.vue'

const props = defineProps<{ readonly entry: Subscriber }>()
const emit = defineEmits<{
  langs: [id: number, langs: readonly Lang[]]
  messageLang: [id: number, messageLang: Lang]
  remove: [id: number]
}>()

const onMessageLang = (next: Lang): void => {
  emit('messageLang', props.entry.id, next)
}
</script>

<template>
  <tr class="subscriber-row" data-testid="subscriber-row">
    <td class="email" data-testid="subscriber-email">{{ entry.email }}</td>
    <td class="langs-cell">
      <LangTogglePills
        :langs="entry.langs"
        :disabled="entry.status !== 'active'"
        @change="langs => emit('langs', entry.id, langs)"
      />
    </td>
    <td class="msg-cell">
      <span class="cell-label" aria-hidden="true">Message</span>
      <MessageLangSelect
        :model-value="entry.messageLang"
        :disabled="entry.status !== 'active'"
        :label="`Message language for ${entry.email}`"
        @update:model-value="onMessageLang"
      />
    </td>
    <td class="status-cell">
      <SubscriberStatusBadge :status="entry.status" />
    </td>
    <td class="actions">
      <button
        type="button"
        class="remove"
        data-testid="subscriber-remove"
        :aria-label="`Remove ${entry.email}`"
        @click="emit('remove', entry.id)"
      >
        ✕
      </button>
    </td>
  </tr>
</template>

<style scoped>
.subscriber-row {
  border-top: 1px solid var(--color-border);
}

.subscriber-row:hover {
  background: var(--color-surface-hover);
}

.subscriber-row td {
  padding: var(--spacing-sm) var(--spacing-xs);
  font-size: 0.875rem;
  vertical-align: middle;
  color: var(--color-text-primary);
  min-width: 0;
}

.email {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.actions {
  text-align: right;
}

.remove {
  width: 2rem;
  height: 2rem;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}

.remove:hover {
  background: var(--color-danger-subtle);
  color: var(--color-danger);
  border-color: var(--color-danger);
}

.remove:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.cell-label {
  display: none;
}

@media (width < 640px) {
  .subscriber-row {
    display: grid;
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'email actions'
      'langs langs'
      'msg msg'
      'status status';
    gap: var(--spacing-xs);
    padding: var(--spacing-sm) 0;
  }

  .subscriber-row td {
    padding: 0;
  }

  .subscriber-row .email {
    grid-area: email;
    font-size: 0.9375rem;
    word-break: break-all;
  }

  .subscriber-row .actions {
    grid-area: actions;
    align-self: start;
  }

  .subscriber-row .langs-cell {
    grid-area: langs;
  }

  .subscriber-row .msg-cell {
    grid-area: msg;
    display: grid;
    gap: 0.25rem;
  }

  .subscriber-row .status-cell {
    grid-area: status;
  }

  .cell-label {
    display: block;
    font-size: 0.75rem;
    color: var(--color-text-secondary);
  }
}
</style>
