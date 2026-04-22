<script setup lang="ts">
defineProps<{
  readonly title: string
  readonly autoPublic: boolean
}>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
defineExpose<{ focusCancel: () => void }>()
</script>

<template>
  <article class="dialog">
    <h2 id="publish-dialog-title">
      Publish to live site?
    </h2>
    <p>
      Saving <strong>{{ title }}</strong> will push the commit to
      <code>develop</code>; the change will be visible on the public site
      in about a minute.
    </p>
    <p v-if="autoPublic" class="hint">
      This content type has no draft mode — every save is a publication.
    </p>
    <nav class="actions">
      <button
        type="button"
        class="btn-cancel"
        data-testid="publish-cancel-btn"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="btn-primary"
        data-testid="publish-confirm-btn"
        @click="emit('confirm')"
      >
        Publish and commit
      </button>
    </nav>
  </article>
</template>

<style scoped>
.dialog {
  background: var(--color-background);
  border-radius: var(--radius-md);
  padding: clamp(1rem, 3vw, 1.5rem);
  max-width: 480px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h2 {
  margin: 0;
  font-size: clamp(1rem, 2.25vw, 1.25rem);
}

p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: clamp(0.875rem, 2vw, 1rem);
  line-height: 1.5;
}

.hint {
  color: var(--color-warning, #b45309);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  cursor: pointer;
  border: 1px solid var(--color-border);
}

.btn-primary {
  background: var(--color-border-hover);
  color: var(--color-text);
  border: none;
}

.btn-cancel {
  background: transparent;
  color: var(--color-text);
}
</style>
