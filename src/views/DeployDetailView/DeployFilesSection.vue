<script setup lang="ts">
import type { CommitFile } from '@/composables/useDeployStatus/fetch-commit-detail'
import DeployFileItem from './DeployFileItem.vue'

defineProps<{ readonly files: readonly CommitFile[] }>()

const icon: Record<string, string> = {
  added: '+',
  removed: '−',
  modified: '~',
  renamed: '→',
}
</script>

<template>
  <section class="files-section">
    <h2>Changed Files ({{ files.length }})</h2>
    <DeployFileItem
      v-for="f in files"
      :key="f.filename"
      :file="f"
      :icon="icon[f.status] ?? '?'"
    />
  </section>
</template>

<style scoped>
.files-section {
  margin-top: 1rem;
  padding: 0 clamp(1rem, 3vw, 2rem);
}

h2 {
  font-size: 1rem;
  color: var(--color-heading);
  margin-bottom: 0.5rem;
}
</style>
