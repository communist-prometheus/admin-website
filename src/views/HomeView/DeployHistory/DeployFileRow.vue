<script setup lang="ts">
import type { CommitFile } from './fetch-commit-files'

defineProps<{ readonly file: CommitFile }>()

const statusIcon: Record<string, string> = {
  added: '+',
  removed: '−',
  modified: '~',
  renamed: '→',
}
</script>

<template>
  <li class="file-row">
    <span class="icon">{{ statusIcon[file.status] ?? '?' }}</span>
    <span class="name">{{ file.filename }}</span>
    <span v-if="file.additions" class="add">+{{ file.additions }}</span>
    <span v-if="file.deletions" class="del">-{{ file.deletions }}</span>
  </li>
</template>

<style scoped>
.file-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.125rem 0;
  color: var(--color-text-secondary);
}

.icon {
  width: 1ch;
  flex-shrink: 0;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.add {
  margin-left: auto;
  flex-shrink: 0;
  color: hsl(140deg 60% 50%);
}

.del {
  flex-shrink: 0;
  color: hsl(0deg 70% 55%);
}
</style>
