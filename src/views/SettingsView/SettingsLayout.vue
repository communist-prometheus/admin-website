<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import SettingsNav from './SettingsNav.vue'
</script>

<template>
  <AppLayout>
    <h1 class="settings-title">Settings</h1>
    <SettingsNav class="settings-nav-slot" />
    <RouterView class="settings-body" />
  </AppLayout>
</template>

<style scoped>
.settings-title {
  margin: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 3vw, 2rem) 0.5rem;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
}

.settings-nav-slot {
  padding: 0 clamp(0.5rem, 2vw, 1rem);
}

.settings-body {
  display: block;
  padding: clamp(1rem, 3vw, 2rem);
  max-inline-size: 60rem;
}
</style>
