<script setup lang="ts">
defineProps<{
  readonly label: string
  readonly elapsed: string
}>()
</script>

<template>
  <p class="progress-info">
    <span class="lbl">{{ label }}</span>
    <span v-if="elapsed" class="time">{{ elapsed }}</span>
  </p>
</template>

<style scoped>
.progress-info {
  display: flex;
  justify-content: space-between;
}

.lbl {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-family: 'Courier New', monospace;
}
</style>
