<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DeployItemHeader from './DeployItemHeader.vue'

defineProps<{
  readonly runId: number
  readonly message: string
  readonly status: string
}>()
</script>

<template>
  <RouterLink
    :to="{ name: 'deploy-detail', params: { runId } }"
    class="deploy-link"
    :data-testid="`deploy-item-link-${runId}`"
  >
    <DeployItemHeader :message="message" :status="status" />
  </RouterLink>
</template>

<style scoped>
.deploy-link {
  display: block;
  color: inherit;
  text-decoration: none;
  border-radius: var(--radius-sm);
}

.deploy-link:hover :deep(.deploy-header),
.deploy-link:focus-visible :deep(.deploy-header) {
  color: var(--color-accent);
}

.deploy-link:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
