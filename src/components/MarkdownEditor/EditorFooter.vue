<script setup lang="ts">
withDefaults(
  defineProps<{
    readonly disabled: boolean
    readonly saving?: boolean
    readonly saved?: boolean
  }>(),
  { saving: false, saved: false }
)

const emit = defineEmits<{ save: [] }>()
</script>

<template>
  <footer class="editor-footer">
    <button
      type="button"
      data-testid="save-button"
      :disabled="disabled || saving"
      :class="{ saving, done: saved }"
      @click="emit('save')"
    >
      {{ saving ? '' : saved ? '✓ Saved' : 'Save' }}
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

.done { color: hsl(140deg 60% 50%); }

.saving::after {
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  border: 2px solid var(--color-text-secondary);
  border-top-color: var(--color-text);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
