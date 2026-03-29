<script setup lang="ts">
import { ref } from 'vue'
import type { CfDeploy } from '@/api/deploys/types'
import DeployDetail from './DeployDetail.vue'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'

defineProps<{
  readonly deploy: CfDeploy
  readonly isLatest: boolean
}>()

const expanded = ref(false)
const toggle = () => { expanded.value = !expanded.value }

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
    <DeployItemHeader :message="deploy.source" />
    <DeployItemMeta
      :author="deploy.versionId.slice(0, 8)"
      :date="formatDate(deploy.createdOn)"
      :sha="deploy.id.slice(0, 8)"
    />
    <DeployDetail
      v-if="expanded"
      :deploy="deploy"
      :is-latest="isLatest"
    />
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
