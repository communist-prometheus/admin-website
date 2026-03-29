<script setup lang="ts">
import type { DeployEntry } from '@/api/deploys/types'
import DeployItem from './DeployItem.vue'

defineProps<{
  readonly deploys: readonly DeployEntry[]
  readonly loading: boolean
}>()
</script>

<template>
  <section class="deploy-list">
    <h2>Recent Deployments</h2>
    <p v-if="loading" class="status">Loading deployments...</p>
    <p v-else-if="deploys.length === 0" class="status">
      No deployments found
    </p>
    <DeployItem
      v-for="d in deploys"
      v-else
      :key="d.id"
      :deploy="d"
    />
  </section>
</template>

<style scoped>
.deploy-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 48rem;
}

h2 {
  font-size: 1.25rem;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}

.status {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
