<script setup lang="ts">
import type { CfDeploy } from '@/api/deploys/types'
import DeployDetailProgress from './DeployDetailProgress.vue'
import DeployDetailRow from './DeployDetailRow.vue'

defineProps<{
  readonly deploy: CfDeploy
  readonly isLatest: boolean
}>()

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'medium',
  })
</script>

<template>
  <section class="deploy-detail">
    <DeployDetailProgress
      :deploy-date="deploy.createdOn"
      :is-latest="isLatest"
    />
    <DeployDetailRow label="Source" :value="deploy.source" />
    <DeployDetailRow label="Date" :value="formatDate(deploy.createdOn)" />
    <DeployDetailRow label="Version" :value="deploy.versionId" />
    <DeployDetailRow label="Deploy ID" :value="deploy.id" />
  </section>
</template>

<style scoped>
.deploy-detail {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
