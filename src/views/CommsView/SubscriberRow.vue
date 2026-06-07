<script setup lang="ts">
import type { Lang, Subscriber } from '@/stores/comms'
import LangTogglePills from './LangTogglePills.vue'
import SubscriberStatusBadge from './SubscriberStatusBadge.vue'

defineProps<{ readonly entry: Subscriber }>()
const emit = defineEmits<{
  langs: [id: number, langs: readonly Lang[]]
  remove: [id: number]
}>()
</script>

<template>
  <tr class="subscriber-row" data-testid="subscriber-row">
    <td class="email" data-testid="subscriber-email">{{ entry.email }}</td>
    <td>
      <LangTogglePills
        :langs="entry.langs"
        :disabled="entry.status !== 'active'"
        @change="langs => emit('langs', entry.id, langs)"
      />
    </td>
    <td>
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
}

.email {
  font-family: var(--font-mono);
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
</style>
