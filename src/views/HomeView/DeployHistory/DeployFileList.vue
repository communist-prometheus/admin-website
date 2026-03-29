<script setup lang="ts">
import DeployFileRow from './DeployFileRow.vue'
import type { CommitFile } from './fetch-commit-files'

defineProps<{ readonly files: readonly CommitFile[] }>()
</script>

<template>
  <ul class="file-list">
    <DeployFileRow v-for="f in files" :key="f.filename" :file="f" />
  </ul>
</template>

<style scoped>
.file-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  font-size: 0.8125rem;
  font-family: 'Courier New', monospace;
}
</style>
