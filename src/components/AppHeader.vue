<script setup lang="ts"></script>

<template>
  <header class="app-header">
    <h1>Admin Panel</h1>
    <slot name="actions" />
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
}

.app-header h1 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 600;
  margin: 0;
}
</style>
