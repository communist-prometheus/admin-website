<script setup lang="ts">
import type { DeployBuild } from '@/composables/useDeployStatus/workflow-types'
import DeployItem from './DeployItem.vue'

defineProps<{
  readonly deploys: ReadonlyArray<DeployBuild>
  readonly loading: boolean
}>()
</script>

<template>
  <section class="deploy-list">
    <h2>Recent Deployments</h2>
    <DeployItem
      v-for="d in deploys"
      :key="d.run.id"
      :build="d"
    />
    <p v-if="loading && deploys.length === 0" class="status">
      Loading deployments...
    </p>
    <p v-else-if="!loading && deploys.length === 0" class="status">
      No deployments found
    </p>
  </section>
</template>

<style scoped>
.deploy-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: clamp(1rem, 3vw, 2rem);
  max-width: 48rem;
  min-width: 0;
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
