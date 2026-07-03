<script setup lang="ts">
import HardResetConfirmActions from './HardResetConfirmActions.vue'

defineEmits<{
  cancel: []
  confirm: []
}>()
</script>

<template>
  <section
    class="dialog-overlay"
    role="alertdialog"
    aria-labelledby="hard-reset-title"
    data-testid="hard-reset-confirm"
  >
    <h3 id="hard-reset-title" class="dialog-title">Reset local data?</h3>
    <p class="dialog-body">
      This will delete every cached artefact the admin app wrote to this
      device (git repository, HTTP caches, IndexedDB, local storage, and the
      service worker) and reload the page. You will be signed out. This can
      not be undone.
    </p>
    <HardResetConfirmActions
      @cancel="$emit('cancel')"
      @confirm="$emit('confirm')"
    />
  </section>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 2rem;
  margin: auto;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
  min-width: 300px;
  max-width: 460px;
  block-size: fit-content;
  display: grid;
  gap: 0.75rem;
  z-index: 1000;
  box-shadow:
    0 0 0 100vmax rgb(0 0 0 / 60%),
    0 8px 24px rgb(0 0 0 / 40%);
  clip-path: inset(-100vmax);
}

.dialog-title {
  font-size: 1rem;
  margin: 0;
}

.dialog-body {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.55;
}
</style>
