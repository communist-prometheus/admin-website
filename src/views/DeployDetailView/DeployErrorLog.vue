<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { fetchJobLog } from '@/composables/useDeployStatus/job-logs'
import { sliceLogByStep, tailLog } from '@/composables/useDeployStatus/slice-log'
import type {
  WorkflowJob,
  WorkflowStep,
} from '@/composables/useDeployStatus/workflow-types'
import DeployErrorLogHeader from './DeployErrorLogHeader.vue'

const props = defineProps<{ readonly job: WorkflowJob }>()

const failedStep = computed<WorkflowStep | undefined>(() =>
  props.job.steps.find(s => s.conclusion === 'failure')
)

const log = ref<string | undefined>(undefined)
const loading = ref(false)
const error = ref<string | undefined>(undefined)

const FETCH_FAIL =
  'Could not fetch the log from GitHub — token missing or job too young.'

const load = async (): Promise<void> => {
  loading.value = true
  error.value = undefined
  try {
    const text = await fetchJobLog(props.job.id)
    error.value = text === undefined ? FETCH_FAIL : undefined
    const sections = text === undefined ? {} : sliceLogByStep(text)
    const stepName = failedStep.value?.name
    const section = stepName ? sections[stepName] : undefined
    log.value = text === undefined ? undefined : tailLog(section ?? text, 200)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const should = failedStep.value !== undefined
  return should ? void load() : undefined
})
</script>

<template>
  <section v-if="failedStep" class="error-log">
    <DeployErrorLogHeader
      :step-name="failedStep.name"
      :can-reload="!loading"
      @reload="load"
    />
    <p v-if="loading" class="hint">Fetching log…</p>
    <p v-else-if="error" class="hint error">{{ error }}</p>
    <pre v-else-if="log" class="log">{{ log }}</pre>
    <p v-else class="hint">No log section captured for this step yet.</p>
  </section>
</template>

<style scoped>
.error-log {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.hint {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
}

.hint.error {
  color: var(--color-accent);
}

.log {
  margin: 0;
  padding: var(--spacing-sm);
  background: var(--color-background-mute, #1a1a1a);
  color: var(--color-text);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.4;
  white-space: pre;
  max-height: 24rem;
  overflow: auto;
}
</style>
