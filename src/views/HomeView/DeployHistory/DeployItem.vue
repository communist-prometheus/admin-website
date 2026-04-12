<script setup lang="ts">
import type { DeployBuild } from '@/composables/useDeployStatus/workflow-types'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'
import DeploySteps from './DeploySteps.vue'

defineProps<{ readonly build: DeployBuild }>()

const status = (b: DeployBuild) => {
  if (b.run.status === 'completed')
    return b.run.conclusion === 'success' ? 'success' : (b.run.conclusion ?? 'failure')
  if (b.run.status === 'in_progress') return 'building'
  return 'queued'
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const firstJob = (b: DeployBuild) => b.jobs[0]
</script>

<template>
  <article
    class="deploy-item"
    :class="{ active: build.run.status !== 'completed' }"
  >
    <DeployItemHeader
      :message="build.run.head_commit?.message?.split('\n')[0] ?? ''"
      :status="status(build)"
    />
    <DeployItemMeta
      :author="build.run.head_commit?.author?.name ?? ''"
      :date="formatDate(build.run.created_at)"
      :sha="build.run.head_sha.slice(0, 7)"
    />
    <DeploySteps
      v-if="firstJob(build)?.steps?.length"
      :steps="firstJob(build)?.steps ?? []"
    />
  </article>
</template>

<style scoped>
.deploy-item {
  display: block;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color var(--transition-fast);
}

.deploy-item.active {
  border-color: var(--color-primary);
}
</style>
