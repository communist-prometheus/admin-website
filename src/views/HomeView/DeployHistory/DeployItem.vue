<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'

const props = defineProps<{ readonly build: CommitBuild }>()

const buildStatus = (b: CommitBuild) => {
  if (b.check?.status === 'completed')
    return b.check.conclusion ?? 'success'
  if (b.check?.status === 'in_progress') return 'building'
  if (b.check?.status === 'queued') return 'queued'
  return 'pending'
}

const pendingPhase = ref<'pending' | 'building'>('pending')
let phaseTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (!props.build.sha) {
    phaseTimer = setTimeout(() => {
      pendingPhase.value = 'building'
    }, 5000)
  }
})

onUnmounted(() => {
  if (phaseTimer) clearTimeout(phaseTimer)
})

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
    v-if="build.sha"
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
  <article v-else class="deploy-item pending-card">
    <DeployItemHeader
      :message="build.message"
      :status="pendingPhase"
    />
    <DeployItemMeta
      :author="build.author"
      :date="formatDate(build.date)"
      sha="..."
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
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast);
}

.deploy-item:hover {
  border-color: var(--color-text-secondary);
}

.pending-card {
  border-color: var(--color-primary);
  opacity: 80%;
}
</style>
