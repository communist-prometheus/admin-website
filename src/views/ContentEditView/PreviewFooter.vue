<script setup lang="ts">
withDefaults(
  defineProps<{
    readonly saving?: boolean
    readonly saved?: boolean
  }>(),
  { saving: false, saved: false }
)

const emit = defineEmits<{ save: []; back: [] }>()
</script>

<template>
  <footer class="preview-footer">
    <button
      type="button"
      class="btn-secondary"
      data-testid="back-to-edit-button"
      :disabled="saving"
      @click="emit('back')"
    >
      Back to edit
    </button>
    <button
      type="button"
      class="btn-primary"
      data-testid="save-button"
      :disabled="saving"
      :class="{ saving, done: saved }"
      @click="emit('save')"
    >
      {{ saving ? '' : saved ? '✓ Saved' : 'Save' }}
    </button>
  </footer>
</template>

<style scoped>
.preview-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-top: 1px solid var(--color-border);
}

button {
  min-width: 5rem;
  min-height: 2.5rem;
  padding: 0.5rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: clamp(0.875rem, 2vw, 1rem);
  cursor: pointer;
}

.btn-primary {
  background: var(--color-border-hover);
  color: var(--color-text);
  border: none;
}

.btn-secondary {
  background: transparent;
  color: var(--color-text);
}

button:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.done {
  color: hsl(140deg 60% 50%);
}
</style>
