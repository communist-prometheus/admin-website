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
  <li class="subscriber-row" data-testid="subscriber-row">
    <span class="email" data-testid="subscriber-email">{{ entry.email }}</span>
    <LangTogglePills
      :langs="entry.langs"
      :disabled="entry.status !== 'active'"
      @change="langs => emit('langs', entry.id, langs)"
    />
    <SubscriberStatusBadge :status="entry.status" />
    <button
      type="button"
      class="remove"
      data-testid="subscriber-remove"
      @click="emit('remove', entry.id)"
    >
      ✕
    </button>
  </li>
</template>

<style scoped>
.subscriber-row {
  list-style: none;
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 0.6rem;
  align-items: center;
  padding: 0.65rem 0;
  border-top: 1px solid var(--color-border);
}

.email {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 0.875rem;
}

.remove {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1rem;
}
</style>
