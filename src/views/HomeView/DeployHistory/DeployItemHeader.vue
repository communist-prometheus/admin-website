<script setup lang="ts">
defineProps<{
  readonly message: string
  readonly source: string
}>()
</script>

<template>
  <header class="deploy-header">
    <span class="commit-msg">{{ message }}</span>
    <span class="source">{{ source }}</span>
  </header>
</template>

<style scoped>
.deploy-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.commit-msg {
  font-weight: 600;
  color: var(--color-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  flex-shrink: 0;
}
</style>
