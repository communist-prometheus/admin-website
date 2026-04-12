<script setup lang="ts">
import { computed } from 'vue'
import { IGNORED_STEPS } from '@/composables/useDeployStatus/workflow-constants'
import type { WorkflowStep } from '@/composables/useDeployStatus/workflow-types'
import DeployStepItem from './DeployStepItem.vue'

const props = defineProps<{
  readonly steps: ReadonlyArray<WorkflowStep>
}>()

const visible = computed(() =>
  props.steps.filter((s) => !IGNORED_STEPS.has(s.name)),
)
</script>

<template>
  <ul class="steps">
    <DeployStepItem v-for="s in visible" :key="s.number" :step="s" />
  </ul>
</template>

<style scoped>
.steps {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}
</style>
