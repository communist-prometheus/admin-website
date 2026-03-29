<script setup lang="ts">
import DeployFileList from './DeployFileList.vue'
import type { CommitFile } from './fetch-commit-files'

defineProps<{
  readonly files: readonly CommitFile[]
  readonly loading: boolean
  readonly expanded: boolean
}>()
</script>

<template>
  <p v-if="expanded && loading" class="loading">
    Loading changes...
  </p>
  <DeployFileList
    v-if="expanded && files.length > 0"
    :files="files"
  />
</template>

<style scoped>
.loading {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin-top: 0.5rem;
}
</style>
