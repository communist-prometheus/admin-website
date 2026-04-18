<script setup lang="ts">
import type { Ticket } from '../api/gh-tickets'

defineProps<{ readonly ticket: Ticket }>()
defineEmits<{ click: [] }>()

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
</script>

<template>
  <article
    class="ticket-card"
    :class="{ closed: ticket.state === 'closed' }"
    data-testid="ticket-card"
    @click="$emit('click')"
  >
    <span class="ticket-num">#{{ ticket.number }}</span>
    <span class="ticket-title">{{ ticket.title }}</span>
    <span class="ticket-meta">
      {{ ticket.user.login }} · {{ formatDate(ticket.created_at) }}
    </span>
  </article>
</template>

<style scoped>
.ticket-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.2s;
}

.ticket-card:hover {
  background: var(--color-background-soft);
}

.ticket-card.closed {
  opacity: 60%;
}

.ticket-num {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  flex-shrink: 0;
}

.ticket-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.ticket-meta {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  flex-shrink: 0;
}
</style>
