<script setup lang="ts">
defineProps<{
  readonly message: string
  readonly status: string
}>()
</script>

<template>
  <header class="deploy-header">
    <span class="msg">{{ message }}</span>
    <span class="badge" :class="status">{{ status }}</span>
  </header>
</template>

<style scoped>
.deploy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.msg {
  font-weight: 600;
  color: var(--color-heading);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.badge {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.125rem 0.375rem;
  border-radius: 3px;
  flex-shrink: 0;
}

.badge.success {
  color: hsl(140deg 80% 35%);
  background: hsl(140deg 40% 15%);
}

.badge.building {
  color: hsl(40deg 90% 55%);
  background: hsl(40deg 50% 15%);
}

.badge.queued {
  color: var(--color-text-secondary);
  background: var(--color-surface);
}

.badge.failure {
  color: hsl(0deg 80% 55%);
  background: hsl(0deg 40% 15%);
}

.badge.pending {
  color: var(--color-text-secondary);
  background: var(--color-surface);
}
</style>
