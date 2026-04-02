<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'

defineProps<{ readonly build: CommitBuild }>()

const buildStatus = (b: CommitBuild) => {
  if (b.check?.status === 'completed')
    return b.check.conclusion ?? 'success'
  if (b.check?.status === 'in_progress') return 'building'
  if (b.check?.status === 'queued') return 'queued'
  return 'pending'
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<template>
  <RouterLink
    :to="{ name: 'deploy-detail', params: { sha: build.sha } }"
    class="deploy-item"
  >
    <DeployItemHeader
      :message="build.message"
      :status="buildStatus(build)"
    />
    <DeployItemMeta
      :author="build.author"
      :date="formatDate(build.date)"
      :sha="build.sha.slice(0, 7)"
    />
  </RouterLink>
</template>

<style scoped>
.deploy-item {
  display: block;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast);
}

.deploy-item:hover {
  border-color: var(--color-text-secondary);
}
</style>
