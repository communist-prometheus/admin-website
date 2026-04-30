<script setup lang="ts">
defineProps<{ readonly target: string }>()
</script>

<template>
  <p class="hint">
    Push to <code>{{ target }}</code> stalled — the following files
    need manual resolution before sync can resume.
  </p>
</template>

<style scoped>
.hint {
  font-size: 0.875rem;
  color: var(--color-text, #444);
}
</style>
