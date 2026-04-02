<script setup lang="ts">
defineProps<{
  readonly icon: string
  readonly filename: string
  readonly additions: number
  readonly deletions: number
}>()
</script>

<template>
  <header class="file-header">
    <span class="icon">{{ icon }}</span>
    <span class="name">{{ filename }}</span>
    <span v-if="additions" class="add">+{{ additions }}</span>
    <span v-if="deletions" class="del">-{{ deletions }}</span>
  </header>
</template>

<style scoped>
.file-header {
  display: flex;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-family: 'Courier New', monospace;
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
