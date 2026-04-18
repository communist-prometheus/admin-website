<script setup lang="ts">
import { computed, ref } from 'vue'
import { clearPendingDeploy } from '@/composables/useDeployStatus/pending-deploy'
import { PENDING_RUN_PREFIX } from '@/composables/useDeployStatus/pending-deploy-projection'
import type { DeployBuild } from '@/composables/useDeployStatus/workflow-types'
import { calcProgress, formatElapsed } from './build-progress'
import DeployItemMeta from './DeployItemMeta.vue'
import DeployItemSummary from './DeployItemSummary.vue'
import DeployProgressBar from './DeployProgressBar.vue'
import DeploySteps from './DeploySteps.vue'

const props = defineProps<{ readonly build: DeployBuild }>()

const isPending = computed(() =>
  props.build.run.head_sha.startsWith(PENDING_RUN_PREFIX),
)

const expanded = ref(false)

const badge = computed<string>(() => {
  const { status, conclusion } = props.build.run
  if (status === 'completed')
    return conclusion === 'success' ? 'success' : (conclusion ?? 'failure')
  if (status === 'in_progress') return 'building'
  return 'queued'
})

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const firstJob = computed(() => props.build.jobs[0])
const hasSteps = computed(() => (firstJob.value?.steps?.length ?? 0) > 0)
const startedAt = computed(
  () => firstJob.value?.started_at ?? props.build.run.created_at
)
const progress = computed(() =>
  props.build.run.status === 'completed'
    ? 100
    : calcProgress(startedAt.value)
)
const elapsed = computed(() => formatElapsed(startedAt.value))
const stepsId = computed(() => `deploy-steps-${props.build.run.id}`)
const messageLine = computed(
  () => props.build.run.head_commit?.message?.split('\n')[0] ?? ''
)

const toggle = (): void => {
  if (hasSteps.value) expanded.value = !expanded.value
}
</script>

<template>
  <article
    class="deploy-item"
    :class="{
      active: build.run.status !== 'completed',
      expanded,
    }"
    :data-testid="`deploy-item-${build.run.id}`"
  >
    <DeployItemSummary
      :message="messageLine"
      :status="badge"
      :expanded="expanded"
      :has-steps="hasSteps"
      :controls="stepsId"
      @toggle="toggle"
    />
    <DeployItemMeta
      :author="build.run.head_commit?.author?.name ?? ''"
      :date="formatDate(build.run.created_at)"
      :sha="build.run.head_sha.slice(0, 7)"
    />
    <DeployProgressBar
      :status="build.run.status"
      :conclusion="build.run.conclusion"
      :progress="progress"
      :elapsed="elapsed"
    />
    <DeploySteps
      v-if="expanded && hasSteps"
      :id="stepsId"
      :steps="firstJob?.steps ?? []"
      data-testid="deploy-item-steps"
    />
    <button
      v-if="isPending"
      class="dismiss"
      @click.stop="clearPendingDeploy()"
    >
      Dismiss
    </button>
  </article>
</template>

<style scoped>
.deploy-item {
  display: block;
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition: border-color var(--transition-fast);
}

.deploy-item.active {
  border-color: var(--color-primary);
}

.dismiss {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.125rem 0.5rem;
  cursor: pointer;
}

.dismiss:hover {
  color: var(--color-heading);
  border-color: var(--color-text-secondary);
}
</style>
