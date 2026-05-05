<script setup lang="ts">
defineProps<{
  readonly status: string
  readonly author: string
  readonly sha: string
  readonly time: string
}>()
</script>

<template>
  <p class="meta">
    <span class="badge" :data-status="status">{{ status }}</span>
    <span>{{ author }}</span>
    <code>{{ sha }}</code>
    <span>{{ time }}</span>
  </p>
</template>

<style scoped>
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin: 0;
  align-items: center;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--color-background-mute);
  color: var(--color-text);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.badge[data-status='failure'],
.badge[data-status='cancelled'],
.badge[data-status='timed_out'] {
  background: var(--color-accent);
  color: #fff;
}

.badge[data-status='success'] {
  background: var(--color-success, #2e7d32);
  color: #fff;
}

code {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}
</style>
