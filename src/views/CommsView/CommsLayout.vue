<script setup lang="ts">
import { RouterView } from 'vue-router'
import { t } from '@/i18n/t'
import CommsNav from './CommsNav.vue'
</script>

<template>
  <AppLayout>
    <h1 class="title" data-testid="comms-view">{{ t('comms.title') }}</h1>
    <p class="lead">{{ t('comms.lead') }}</p>
    <CommsNav class="nav-slot" />
    <RouterView />
  </AppLayout>
</template>

<style scoped>
.title {
  margin: clamp(1rem, 3vw, 1.5rem) var(--content-frame-padding) 0.25rem;
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--color-text-primary);
}

.lead {
  margin: 0 var(--content-frame-padding) var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  max-width: var(--content-medium);
}

.nav-slot {
  padding-inline: var(--content-frame-padding);
}
</style>
