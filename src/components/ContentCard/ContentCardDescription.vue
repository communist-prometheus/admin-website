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
  font-size: 0.875rem;
  margin-bottom: 0;
}
</style>
