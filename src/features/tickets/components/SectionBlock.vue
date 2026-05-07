<script setup lang="ts">
defineProps<{ readonly label: string; readonly text: string }>()
</script>

<template>
  <section class="section-block">
    <h4 class="label">{{ label }}</h4>
    <p v-if="text" class="text">{{ text }}</p>
    <p v-else class="empty">_(empty)_</p>
  </section>
</template>

<style scoped>
.section-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: var(--color-background-soft);
  border-radius: var(--radius-sm);
}

.label {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}

.text {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.6;
}

.empty {
  margin: 0;
  color: var(--color-text-secondary);
  font-style: italic;
  font-size: 0.875rem;
}
</style>
