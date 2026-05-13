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
/*
 * `position: sticky; bottom: 0` was the original intent (keep
 * Preview reachable on long pages), but the sticky containing
 * block here is `.edit-body-area`, which on /content/newspaper/edit
 * sits entirely below the viewport at scrollY=0 (frontmatter +
 * articles picker push it down past 812px on a 375x812 mobile).
 * Sticky then clamps to `.edit-body-area`'s TOP instead of the
 * viewport bottom — the Preview footer was rendering on TOP of the
 * "Source files" section header. Natural flow places the footer
 * after content, which scroll-reaches without the overlap.
 *
 * Mobile-FAB safe gutter still applies so the Preview button
 * doesn't slide under the floating navigation button.
 */
.editor-footer {
  display: flex;
  padding: clamp(0.75rem, 2vw, 1rem);
  padding-inline-end: max(
    clamp(0.75rem, 2vw, 1rem),
    var(--fab-safe-inline-end)
  );
  border-top: 1px solid var(--color-border);
  justify-content: flex-end;
  background: var(--color-background);
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
