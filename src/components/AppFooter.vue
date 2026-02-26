<script setup lang="ts"></script>

<template>
  <footer class="app-footer">
    <slot />
  </footer>
</template>

<style scoped>
.app-footer {
  display: block;
  padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem);
  border-top: 1px solid var(--color-border);
  background: var(--color-background-mute);
  text-align: center;
  color: var(--color-text-muted);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}
</style>
