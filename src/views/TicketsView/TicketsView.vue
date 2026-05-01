<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import type { Ticket } from '@/features/tickets/api/gh-tickets'
import { listTickets } from '@/features/tickets/api/gh-tickets'
import { useAuthStore } from '@/stores/auth'
import TicketsHeader from './TicketsHeader.vue'

const auth = useAuthStore()
const tickets = ref<readonly Ticket[]>([])
const loading = ref(true)
const showCreate = ref(false)

const load = async (): Promise<void> => {
  if (!auth.user) return
  loading.value = true
  try {
    tickets.value = await listTickets(auth.user.accessToken, 'all')
  } finally {
    loading.value = false
  }
}

const toggleCreate = (): void => {
  showCreate.value = !showCreate.value
}

onMounted(load)
</script>

<template>
  <AppLayout>
    <TicketsHeader
      :show-create="showCreate"
      :loading="loading"
      :tickets="tickets"
      @toggle-create="toggleCreate"
      @reload="load"
    />
  </AppLayout>
</template>
