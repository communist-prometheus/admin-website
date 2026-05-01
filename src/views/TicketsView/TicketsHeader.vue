<script setup lang="ts">
import type { Ticket } from '@/features/tickets/api/gh-tickets'
import { createTicket } from '@/features/tickets/api/ticket-actions'
import CreateTicketForm from '@/features/tickets/components/CreateTicketForm.vue'
import TicketCard from '@/features/tickets/components/TicketCard.vue'
import { useAuthStore } from '@/stores/auth'

defineProps<{
  readonly showCreate: boolean
  readonly loading: boolean
  readonly tickets: readonly Ticket[]
}>()

const emit = defineEmits<{
  'toggle-create': []
  reload: []
}>()

const auth = useAuthStore()

const handleCreate = async (
  title: string,
  body: string,
  labels: readonly string[]
): Promise<void> => {
  if (!auth.user) return
  try {
    await createTicket(auth.user.accessToken, title, body, labels)
    emit('toggle-create')
    emit('reload')
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed'
    globalThis.alert(msg)
  }
}
</script>

<template>
  <section class="tickets-page">
    <h2>Tickets</h2>
    <button type="button" class="btn-new" @click="emit('toggle-create')">
      {{ showCreate ? 'Cancel' : '+ New Ticket' }}
    </button>
    <CreateTicketForm v-if="showCreate" @create="handleCreate" />
    <p v-if="loading" class="status">Loading tickets...</p>
    <TicketCard v-for="t in tickets" :key="t.number" :ticket="t" />
  </section>
</template>

<style scoped>
.tickets-page {
  padding: clamp(1rem, 3vw, 2rem);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

h2 {
  font-size: 1.5rem;
  margin: 0;
}

.btn-new {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
}

.status {
  color: var(--color-text-secondary);
}
</style>
