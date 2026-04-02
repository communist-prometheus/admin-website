<script setup lang="ts">
import { ref } from 'vue'
import type { CommitFile } from '@/composables/useDeployStatus/fetch-commit-detail'
import DeployFileItemHeader from './DeployFileItemHeader.vue'

defineProps<{
  readonly file: CommitFile
  readonly icon: string
}>()

const showPatch = ref(false)
const toggle = () => {
  showPatch.value = !showPatch.value
}
</script>

<template>
  <article class="file-item" @click="toggle">
    <DeployFileItemHeader
      :icon="icon"
      :filename="file.filename"
      :additions="file.additions"
      :deletions="file.deletions"
    />
    <pre v-if="showPatch && file.patch" class="patch">{{ file.patch }}</pre>
  </article>
</template>

<style scoped>
.file-item {
  cursor: pointer;
  border-bottom: 1px solid var(--color-border);
  padding: 0.375rem 0;
}

.patch {
  margin: 0.5rem 0 0;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  overflow-x: auto;
  white-space: pre;
  color: var(--color-text-secondary);
}
</style>
