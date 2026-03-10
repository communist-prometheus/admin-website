<script setup lang="ts">
defineEmits<{
  readonly refresh: []
  readonly close: []
}>()
</script>

<template>
  <nav class="sw-actions" data-testid="sw-actions">
    <button type="button" @click="$emit('refresh')">
      Refresh
    </button>
    <button type="button" @click="$emit('close')">
      Close
    </button>
  </nav>
</template>

<style scoped>
.sw-actions {
  display: flex;
  gap: 0.5em;
  padding: 0.25em 1em;
  background: #1a1a2e;
}

.sw-actions button {
  background: #333;
  color: #e0e0e0;
  border: 1px solid #555;
  border-radius: 3px;
  padding: 0.2em 0.75em;
  font-size: 0.75rem;
  cursor: pointer;
}

.sw-actions button:hover {
  background: #444;
}
</style>
