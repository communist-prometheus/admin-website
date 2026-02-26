<script setup lang="ts"></script>

<template>
  <main class="app-main">
    <slot />
  </main>
</template>

<style scoped>
.app-main {
  display: block;
  padding: clamp(1rem, 4vw, 2rem);
  color: var(--color-text);
}
</style>
