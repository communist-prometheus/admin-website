<script setup lang="ts">
import type { WorkflowStep } from '@/composables/useDeployStatus/workflow-types'
import DeploySteps from '@/views/HomeView/DeployHistory/DeploySteps.vue'

defineProps<{ readonly steps: ReadonlyArray<WorkflowStep> }>()
</script>

<template>
  <section
    class="steps-card"
    data-testid="deploy-detail-steps"
    aria-label="Build steps"
  >
    <DeploySteps :steps="steps" />
  </section>
</template>

<style scoped>
.steps-card {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
</style>
