<script setup lang="ts">
const PATH =
  'M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z'
</script>

<template>
  <svg
    class="bell-icon"
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
    fill="currentColor"
  >
    <path :d="PATH" />
  </svg>
</template>

<style scoped>
.bell-icon {
  pointer-events: none;
}
</style>
