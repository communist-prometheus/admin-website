<script setup lang="ts">
interface Props {
  name: string
  email: string
}

defineProps<Props>()
</script>

<template>
  <h3>{{ name }}</h3>
  <p>{{ email }}</p>
</template>

<style scoped>
:host {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);

  & h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
  }

  & p {
    margin: 0;
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }
}
</style>
