<script setup lang="ts">
defineProps<{
  readonly title: string
  readonly hint: string
}>()
</script>

<template>
  <header class="source-uploads-header">
    <h2 class="source-uploads-title">{{ title }}</h2>
    <p class="source-uploads-hint">{{ hint }}</p>
  </header>
</template>

<style scoped>
.source-uploads-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.source-uploads-title {
  font-size: 0.875rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0;
}

.source-uploads-hint {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.4;
}
</style>
