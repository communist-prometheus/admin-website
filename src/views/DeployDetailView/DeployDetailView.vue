<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import DeployDetailBody from './DeployDetailBody.vue'
import { useDeployDetail } from './use-deploy-detail'

const route = useRoute()
const runIdParam = computed(() => Number(route.params['runId']))
const state = useDeployDetail(runIdParam.value)
</script>

<template>
  <AppLayout>
    <DeployDetailBody
      class="deploy-detail"
      :run-id="runIdParam"
      :run="state.run"
      :jobs="state.jobs"
      :loading="state.loading"
      :error="state.error"
    />
  </AppLayout>
</template>

<style scoped>
.deploy-detail {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--content-frame-padding);
  max-width: var(--content-medium);
  width: 100%;
  margin-inline: auto;
  box-sizing: border-box;
}
</style>
