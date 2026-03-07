<script setup lang="ts">
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useContentStore } from '@/stores/content'

const authStore = useAuthStore()
const contentStore = useContentStore()

watch(
  () => authStore.user,
  (user) => { if (user) contentStore.loadAll() },
  { immediate: true },
)
</script>

<template>
  <RouterView />
</template>
