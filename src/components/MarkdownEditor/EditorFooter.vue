<script setup lang="ts">
withDefaults(
  defineProps<{
    readonly disabled: boolean
  }>(),
  {}
)

const emit = defineEmits<{ preview: [] }>()
</script>

<template>
  <footer class="editor-footer">
    <button
      type="button"
      data-testid="preview-button"
      :disabled="disabled"
      @click="emit('preview')"
    >
      Preview
    </button>
  </footer>
</template>

<style scoped>
.editor-footer {
  display: flex;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-top: 1px solid var(--color-border);
  justify-content: flex-end;
}

button {
  min-width: 5rem;
  min-height: 2.5rem;
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 3vw, 1.5rem);
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-border-hover);
  color: var(--color-text);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

button:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background: var(--color-border);
}
</style>
