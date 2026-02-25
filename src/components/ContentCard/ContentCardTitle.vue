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
  font-size: clamp(1.125rem, 2.5vw, 1.25rem);
  font-weight: 600;
  margin: 0 0 clamp(0.5rem, 1.5vw, 0.75rem);
}
</style>
