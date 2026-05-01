<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import type { Ticket } from '@/features/tickets/api/gh-tickets'
import { listTickets } from '@/features/tickets/api/gh-tickets'
import TicketDetail from '@/features/tickets/components/TicketDetail.vue'
import { useAuthStore } from '@/stores/auth'
import TicketNotFound from './TicketNotFound.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const tickets = ref<readonly Ticket[]>([])
const loading = ref(true)

const number = computed(() => Number(route.params['number']))
const ticket = computed(() => tickets.value.find((t) => t.number === number.value))

const load = async (): Promise<void> => {
  if (!auth.user) return
  loading.value = true
  try {
    tickets.value = await listTickets(auth.user.accessToken, 'all')
  } finally {
    loading.value = false
  }
}

const onBack = (): void => {
  router.push({ name: 'tickets' })
}

watch(number, () => {
  void load()
})
onMounted(load)
</script>

<template>
  <AppLayout>
    <p v-if="loading" class="status">Loading ticket...</p>
    <TicketDetail
      v-else-if="ticket"
      :ticket="ticket"
      @back="onBack"
      @reload="load"
    />
    <TicketNotFound v-else :number="number" @back="onBack" />
  </AppLayout>
</template>

<style scoped>
.status {
  padding: clamp(1rem, 3vw, 2rem);
  color: var(--color-text-secondary);
}
</style>
