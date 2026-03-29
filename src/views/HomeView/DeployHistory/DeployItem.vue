<script setup lang="ts">
import type { CfDeploy } from '@/api/deploys/types'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'
import DeployProgress from './DeployProgress.vue'

defineProps<{
  readonly deploy: CfDeploy
  readonly isLatest: boolean
}>()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
</script>

<template>
  <article class="deploy-item">
    <DeployProgress
      :deploy-date="deploy.createdOn"
      :is-latest="isLatest"
    />
    <DeployItemHeader :message="deploy.source" />
    <DeployItemMeta
      :author="deploy.versionId.slice(0, 8)"
      :date="formatDate(deploy.createdOn)"
      :sha="deploy.id.slice(0, 8)"
    />
  </article>
</template>

<style scoped>
.deploy-item {
  padding: 0.75rem 1rem;
  padding-top: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;
}
</style>
