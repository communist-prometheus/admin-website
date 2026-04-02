<script setup lang="ts">
import type { CheckRun } from '@/composables/useDeployStatus/check-runs'
import DeployStatusBar from './DeployStatusBar.vue'
import DeployStatusMeta from './DeployStatusMeta.vue'

defineProps<{
  readonly check: CheckRun
  readonly sha: string
}>()
</script>

<template>
  <section class="status-section">
    <DeployStatusBar :check="check" />
    <DeployStatusMeta :check="check" :sha="sha" />
    <p
      v-if="check.conclusion === 'failure' && check.output?.summary"
      class="error-box"
    >
      {{ check.output.summary }}
    </p>
  </section>
</template>

<style scoped>
.status-section {
  padding: 0 clamp(1rem, 3vw, 2rem);
  margin-bottom: 1.5rem;
}

.error-box {
  margin-top: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  background: hsl(0deg 40% 15%);
  color: hsl(0deg 70% 70%);
  font-size: 0.8125rem;
  white-space: pre-wrap;
  font-family: 'Courier New', monospace;
}
</style>
