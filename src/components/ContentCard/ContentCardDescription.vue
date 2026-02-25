<script setup lang="ts">
defineProps<{
  description: string
}>()
</script>

<template>
  <p>{{ description }}</p>
</template>

<style scoped>
p {
  font-size: clamp(0.8125rem, 1.8vw, 0.875rem);
  margin: 0;
  line-height: 1.5;
}
</style>
