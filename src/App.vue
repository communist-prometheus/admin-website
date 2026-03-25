<script setup lang="ts">
import { watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useContentStore } from '@/stores/content'

const route = useRoute()
const authStore = useAuthStore()
const contentStore = useContentStore()

watch(
  () => authStore.user,
  (user) => { if (user) contentStore.loadAll() },
  { immediate: true },
)
</script>

<template>
  <RouterView :key="route.fullPath" />
  <SWDebugPanel />
</template>
