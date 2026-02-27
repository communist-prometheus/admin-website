<script setup lang="ts">
const emit = defineEmits<{ create: [] }>()
</script>

<template>
  <div class="list-header">
    <h2>Content Files</h2>
    <button
      type="button"
      class="btn btn-primary"
      data-testid="create-button"
      @click="emit('create')"
    >
      + New
    </button>
  </div>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-background);
  z-index: 1;
}

h2 {
  margin: 0;
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 600;
}

.btn {
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem);
  border: none;
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.btn-primary {
  background: var(--color-heading);
  color: var(--color-background);

  &:hover {
    opacity: 90%;
  }
}
</style>
