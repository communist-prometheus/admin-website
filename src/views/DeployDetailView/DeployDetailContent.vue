<script setup lang="ts">
import { computed } from 'vue'
import type {
  WorkflowJob,
  WorkflowRun,
} from '@/composables/useDeployStatus/workflow-types'
import DeployDetailHeader from './DeployDetailHeader.vue'
import DeployDetailLinks from './DeployDetailLinks.vue'
import DeployErrorLog from './DeployErrorLog.vue'
import DeployStepsCard from './DeployStepsCard.vue'

const props = defineProps<{
  readonly run: WorkflowRun
  readonly jobs: ReadonlyArray<WorkflowJob>
}>()

const firstJob = computed(() => props.jobs[0])
const hasFailure = computed(
  () => firstJob.value?.steps.some(s => s.conclusion === 'failure') ?? false
)
</script>

<template>
  <DeployDetailHeader :run="run" />
  <DeployStepsCard :steps="firstJob?.steps ?? []" />
  <DeployErrorLog v-if="hasFailure && firstJob" :job="firstJob" />
  <DeployDetailLinks :run="run" />
</template>
