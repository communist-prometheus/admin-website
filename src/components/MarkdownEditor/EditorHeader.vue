<script setup lang="ts">
defineProps<{
  readonly filePath: string
}>()
</script>

<template>
  <h2>{{ filePath }}</h2>
</template>

<style scoped>
h2 {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.25rem);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
