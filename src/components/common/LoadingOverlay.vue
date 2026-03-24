<script setup lang="ts">
defineProps<{
  readonly show: boolean
}>()
</script>

<template>
  <output
    v-if="show"
    class="loading-overlay"
  >
    <p>Loading...</p>
  </output>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
  z-index: 1000;
}

.loading-overlay p {
  padding: clamp(1rem, 2vw, 2rem);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--color-text);
}
</style>
