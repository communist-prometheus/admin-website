<script setup lang="ts">
import { ref } from 'vue'
import type { DeployEntry } from '@/api/deploys/types'
import DeployItemBody from './DeployItemBody.vue'
import DeployItemHeader from './DeployItemHeader.vue'
import DeployItemMeta from './DeployItemMeta.vue'
import DeployProgress from './DeployProgress.vue'
import type { CommitFile } from './fetch-commit-files'
import { fetchCommitFiles } from './fetch-commit-files'

const props = defineProps<{
  readonly deploy: DeployEntry
  readonly isLatest: boolean
}>()

const expanded = ref(false)
const files = ref<readonly CommitFile[]>([])
const loadingFiles = ref(false)

const toggle = async () => {
  expanded.value = !expanded.value
  if (!expanded.value || files.value.length > 0) return
  if (!props.deploy.commit?.sha) return
  loadingFiles.value = true
  files.value = await fetchCommitFiles(props.deploy.commit.sha)
  loadingFiles.value = false
}

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
    <DeployProgress
      :deploy-date="deploy.createdOn"
      :is-latest="isLatest"
    />
    <DeployItemHeader
      :message="deploy.commit?.message ?? 'Unknown commit'"
    />
    <DeployItemMeta
      :author="deploy.commit?.author ?? 'unknown'"
      :date="formatDate(deploy.createdOn)"
      :sha="deploy.commit?.sha.slice(0, 7) ?? '—'"
    />
    <DeployItemBody
      :files="files"
      :loading="loadingFiles"
      :expanded="expanded"
    />
  </article>
</template>

<style scoped>
.deploy-item {
  padding: 0.75rem 1rem;
  padding-top: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.deploy-item:hover {
  border-color: var(--color-text-secondary);
}

.expanded {
  border-color: var(--color-primary);
}
</style>
