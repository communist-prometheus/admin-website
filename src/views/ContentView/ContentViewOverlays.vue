<script setup lang="ts">
defineProps<{
  readonly loading: boolean
  readonly error: string | null
}>()
</script>

<template>
  <div
    v-if="loading"
    class="loading-overlay"
  >
    <p>Loading...</p>
  </div>
  
  <div
    v-if="error"
    class="error-message"
  >
    <p>Error: {{ error }}</p>
  </div>
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

.error-message {
  position: fixed;
  top: clamp(1rem, 2vw, 2rem);
  right: clamp(1rem, 2vw, 2rem);
  padding: clamp(0.75rem, 2vw, 1rem);
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  z-index: 1000;
}

.error-message p {
  margin: 0;
  color: #ef4444;
  font-size: clamp(0.875rem, 2vw, 1rem);
}
</style>
