<script setup lang="ts">
import { ref } from 'vue'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import DeployDetail from './DeployDetail.vue'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'

defineProps<{ readonly build: CommitBuild }>()

const expanded = ref(false)
const toggle = () => {
  expanded.value = !expanded.value
}

const buildStatus = (b: CommitBuild) => {
  if (b.check?.status === 'completed') return b.check.conclusion ?? 'success'
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
  <article
    class="deploy-item"
    :class="{ expanded }"
    @click="toggle"
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
    <DeployDetail v-if="expanded" :build="build" />
  </article>
</template>

<style scoped>
.deploy-item {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  transition: border-color var(--transition-fast);
}

.deploy-item:hover {
  border-color: var(--color-text-secondary);
}

.expanded {
  border-color: var(--color-primary);
}
</style>
