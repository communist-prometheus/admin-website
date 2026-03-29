<script setup lang="ts">
defineProps<{
  readonly label: string
  readonly value: string
}>()
</script>

<template>
  <p class="detail-row">
    <span class="label">{{ label }}</span>
    <code class="value">{{ value }}</code>
  </p>
</template>

<style scoped>
.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8125rem;
}

.label { color: var(--color-text-secondary); }

.value {
  font-family: 'Courier New', monospace;
  color: var(--color-text-primary);
  font-size: 0.75rem;
}
</style>
