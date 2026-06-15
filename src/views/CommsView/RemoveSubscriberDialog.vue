<script setup lang="ts">
defineProps<{
  readonly email: string | undefined
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <section
    v-if="email"
    class="dialog-overlay"
    role="alertdialog"
    aria-labelledby="remove-subscriber-title"
    data-testid="remove-subscriber-dialog"
    @click.self="emit('cancel')"
  >
    <div class="card">
      <h2 id="remove-subscriber-title" class="title">
        Remove subscriber?
      </h2>
      <p class="body">
        <strong class="email">{{ email }}</strong> will stop receiving
        the newsletter. This cannot be undone.
      </p>
      <div class="actions">
        <button
          type="button"
          class="btn btn-cancel"
          data-testid="remove-subscriber-cancel"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-danger"
          data-testid="remove-subscriber-confirm"
          @click="emit('confirm')"
        >
          Remove
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
  z-index: 1000;
  padding: 2rem;
}

.card {
  width: min(28rem, 100%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  display: grid;
  gap: var(--spacing-sm);
}

.title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.body {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--color-text-secondary);
}

.email {
  font-family: var(--font-mono);
  color: var(--color-text-primary);
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.btn {
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font: 600 0.95rem/1 var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
  transition:
    background var(--transition-fast),
    border-color var(--transition-fast);
}

.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn-cancel {
  background: transparent;
  color: var(--color-text-primary);
  border-color: var(--color-border);
}

.btn-cancel:hover {
  border-color: var(--color-text-secondary);
}

.btn-danger {
  background: var(--color-danger);
  color: var(--color-background);
  border-color: var(--color-danger);
}

.btn-danger:hover {
  filter: brightness(1.08);
}

@media (width < 640px) {
  .actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}
</style>
