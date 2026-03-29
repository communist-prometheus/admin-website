<script setup lang="ts">
import type { DeployEntry } from '@/api/deploys/types'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'

defineProps<{ readonly deploy: DeployEntry }>()

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
    <DeployItemHeader
      :message="deploy.commit?.message ?? 'Unknown commit'"
      :source="deploy.source"
    />
    <DeployItemMeta
      :author="deploy.commit?.author ?? 'unknown'"
      :date="formatDate(deploy.createdOn)"
      :sha="deploy.commit?.sha.slice(0, 7) ?? '—'"
    />
  </article>
</template>

<style scoped>
.deploy-item {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}
</style>
