<script setup lang="ts"></script>

<template>
  <main class="app-main">
    <slot />
  </main>
</template>

<style scoped>
.app-main {
  display: block;
  min-width: 0;
  color: var(--color-text);
}
</style>
