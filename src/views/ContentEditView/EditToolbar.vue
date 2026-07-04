<script setup lang="ts">
withDefaults(
  defineProps<{
    readonly saving?: boolean
    readonly saved?: boolean
    readonly previewing?: boolean
  }>(),
  { saving: false, saved: false, previewing: false }
)

const emit = defineEmits<{
  save: []
  preview: []
  'back-to-edit': []
}>()
</script>

<template>
  <div
    class="edit-toolbar"
    role="toolbar"
    aria-label="Article actions"
    data-testid="edit-toolbar"
  >
    <button
      v-if="!previewing"
      type="button"
      class="btn-secondary"
      data-testid="preview-button"
      :disabled="saving"
      @click="emit('preview')"
    >
      Preview
    </button>
    <button
      v-else
      type="button"
      class="btn-secondary"
      data-testid="back-to-edit-button"
      :disabled="saving"
      @click="emit('back-to-edit')"
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
  </div>
</template>

<style scoped>
/*
 * Sticky top toolbar for the article editor. The old flow put Save at
 * the BOTTOM of a preview footer, so on a long article the user had to
 * scroll to the end just to save — worse still, Preview lived AFTER
 * the markdown editor (below the fold on a mobile viewport too).
 *
 * `position: fixed; top: var(--app-vt, 0px)` pins the bar to the top
 * of the VISIBLE viewport (visualViewport-tracked). On mobile with a
 * virtual keyboard the layout viewport doesn't move — but the visible
 * viewport does; the `--app-vt` offset keeps the toolbar glued to what
 * the user actually sees, not to the layout origin.
 *
 * A safe-area gap lives on the parent view (ContentEditView) as a
 * `scroll-padding-block-start` and a matching top padding so page
 * content isn't hidden under the fixed toolbar.
 */
.edit-toolbar {
  position: fixed;
  inset-block-start: var(--app-vt, 0);
  inset-inline: 0;
  z-index: 20;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
  border-bottom: 1px solid var(--color-border);
  background: color-mix(in srgb, var(--color-background) 92%, transparent);
  backdrop-filter: blur(6px);
}

button {
  min-inline-size: 5rem;
  min-block-size: 2.25rem;
  padding: 0.4rem 1rem;
  border-radius: var(--radius-md);
  font-size: clamp(0.85rem, 2vw, 0.95rem);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-primary {
  border: none;
  background: var(--color-border-hover);
  color: var(--color-text);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-border);
}

.btn-secondary {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-background-soft);
}

button:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.done {
  color: hsl(140deg 60% 50%);
}

.saving {
  color: transparent;
}

.saving::after {
  content: '';
  position: absolute;
  inline-size: 1em;
  block-size: 1em;
  margin-inline-start: -0.5em;
  border: 2px solid var(--color-text-secondary);
  border-block-start-color: var(--color-text);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
