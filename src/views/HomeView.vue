<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/stores/auth'
import HomeDashboard from './HomeView/HomeDashboard.vue'
import HomeWelcome from './HomeView/HomeWelcome.vue'

useAuth()
const authStore = useAuthStore()
</script>

<template>
  <AppLayout>
    <HomeWelcome v-if="!authStore.user && !authStore.loading" />
    <HomeDashboard v-else :show-grid="!!authStore.user" />
  </AppLayout>
</template>
