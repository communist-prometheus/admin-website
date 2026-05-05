<script setup lang="ts">
import type { WorkflowRun } from '@/composables/useDeployStatus/workflow-types'

const REPO_HTML = 'https://github.com/communist-prometheus/public-website'
const CONTENT_REPO_HTML =
  'https://github.com/communist-prometheus/public-website-content'

defineProps<{ readonly run: WorkflowRun }>()

const isContentTriggered = (msg: string): boolean =>
  msg.startsWith('content:')

const stripPrefix = (msg: string): string =>
  msg.replace(/^content:\s*/, '').split('\n')[0] ?? ''
</script>

<template>
  <nav class="deploy-detail-links" aria-label="External links">
    <a
      :href="`${REPO_HTML}/actions/runs/${run.id}`"
      target="_blank"
      rel="noopener noreferrer"
      class="ext"
    >
      Open run on GitHub Actions ↗
    </a>
    <a
      :href="`${REPO_HTML}/commit/${run.head_sha}`"
      target="_blank"
      rel="noopener noreferrer"
      class="ext"
    >
      Trigger commit on public-website ↗
    </a>
    <a
      v-if="isContentTriggered(run.head_commit?.message ?? '')"
      :href="`${CONTENT_REPO_HTML}/commits/master`"
      target="_blank"
      rel="noopener noreferrer"
      class="ext content"
    >
      Latest content commits — “{{ stripPrefix(run.head_commit?.message ?? '') }}” ↗
    </a>
  </nav>
</template>

<style scoped>
.deploy-detail-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.ext {
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.ext:hover {
  text-decoration: underline;
}

.ext.content {
  font-style: italic;
}
</style>
