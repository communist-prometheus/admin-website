<script setup lang="ts">
import type {
  WorkflowJob,
  WorkflowRun,
} from '@/composables/useDeployStatus/workflow-types'
import DeployDetailContent from './DeployDetailContent.vue'

defineProps<{
  readonly runId: number
  readonly run: WorkflowRun | undefined
  readonly jobs: ReadonlyArray<WorkflowJob>
  readonly loading: boolean
  readonly error: string | undefined
}>()
</script>

<template>
  <p v-if="loading" class="loading">Loading deploy {{ runId }}…</p>
  <p v-else-if="error" class="error">{{ error }}</p>
  <DeployDetailContent v-else-if="run" :run="run" :jobs="jobs" />
</template>

<style scoped>
.loading,
.error {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-accent);
}
</style>
