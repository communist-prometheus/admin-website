<script setup lang="ts">
defineProps<{
  readonly author: string
  readonly date: string
  readonly sha: string
}>()
</script>

<template>
  <footer class="deploy-meta">
    <span class="author">{{ author }}</span>
    <time class="date">{{ date }}</time>
    <code class="sha">{{ sha }}</code>
  </footer>
</template>

<style scoped>
.deploy-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.sha {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
}
</style>
