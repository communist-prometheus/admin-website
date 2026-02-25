<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <h2>{{ title }}</h2>
</template>

<style scoped>
h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
}
</style>
