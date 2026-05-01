<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Ticket } from '../api/gh-tickets'

defineProps<{ readonly ticket: Ticket }>()

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso))
</script>

<template>
  <RouterLink
    :to="{ name: 'ticket-detail', params: { number: ticket.number } }"
    class="ticket-card"
    :class="{ closed: ticket.state === 'closed' }"
    data-testid="ticket-card"
  >
    <span class="ticket-num">#{{ ticket.number }}</span>
    <span class="ticket-title">{{ ticket.title }}</span>
    <span class="ticket-meta">
      {{ ticket.user.login }} · {{ formatDate(ticket.created_at) }}
    </span>
  </RouterLink>
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
  text-decoration: none;
  color: inherit;
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
