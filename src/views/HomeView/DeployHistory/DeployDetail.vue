<script setup lang="ts">
import type { CommitBuild } from '@/composables/useDeployStatus/check-runs'
import DeployDetailProgress from './DeployDetailProgress.vue'
import DeployDetailRow from './DeployDetailRow.vue'

defineProps<{ readonly build: CommitBuild }>()

const formatDate = (iso: string | undefined) =>
  iso
    ? new Date(iso).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'medium',
      })
    : '—'
</script>

<template>
  <section class="deploy-detail">
    <DeployDetailProgress :sha="build.sha" :check="build.check" />
    <DeployDetailRow label="Commit" :value="build.sha" />
    <DeployDetailRow label="Author" :value="build.author" />
    <DeployDetailRow label="Date" :value="formatDate(build.date)" />
    <DeployDetailRow
      label="Started"
      :value="formatDate(build.check?.started_at)"
    />
    <DeployDetailRow
      label="Finished"
      :value="formatDate(build.check?.completed_at)"
    />
  </section>
</template>

<style scoped>
.deploy-detail {
  padding-top: 0.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
