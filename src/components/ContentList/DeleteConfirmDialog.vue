<script setup lang="ts">
import type { Language } from '@/types/content'

defineProps<{
  readonly show: boolean
  readonly slug: string
  readonly currentLang: Language
}>()

const emit = defineEmits<{
  'delete-all': []
  'delete-lang': []
  close: []
}>()
</script>

<template>
  <section
    v-if="show"
    class="dialog-overlay"
    data-testid="delete-dialog"
    role="alertdialog"
    @click.self="emit('close')"
  >
    <p class="dialog-title">
      Delete "{{ slug }}"?
    </p>
    <button
      type="button"
      class="btn-danger"
      data-testid="delete-all-btn"
      @click="emit('delete-all')"
    >
      Delete all languages
    </button>
    <button
      type="button"
      class="btn-warn"
      data-testid="delete-lang-btn"
      @click="emit('delete-lang')"
    >
      Delete only {{ currentLang }}
    </button>
    <button
      type="button"
      class="btn-cancel"
      data-testid="delete-cancel-btn"
      @click="emit('close')"
    >
      Cancel
    </button>
  </section>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgb(0 0 0 / 50%);
  z-index: 1000;
  padding: 2rem;
}

.dialog-title {
  margin: 0 0 0.5rem;
  font-size: clamp(1rem, 2vw, 1.25rem);
  font-weight: 600;
  color: var(--color-text);
  background: var(--color-background);
  padding: 1rem 2rem;
  border-radius: var(--radius-md);
}

.dialog-overlay button {
  padding: 0.5rem 2rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  cursor: pointer;
  min-width: 200px;
}

.btn-danger {
  background: var(--color-error, #e53935);
  color: #fff;
}

.btn-warn {
  background: var(--color-warning, #ff9800);
  color: #fff;
}

.btn-cancel {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
</style>
