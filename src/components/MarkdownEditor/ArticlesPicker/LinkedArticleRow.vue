<script setup lang="ts">
defineProps<{
  readonly slug: string
  readonly title: string
  readonly position: number
  readonly canMoveUp: boolean
  readonly canMoveDown: boolean
}>()

defineEmits<{
  up: []
  down: []
  remove: []
}>()
</script>

<template>
  <li class="linked-row" :data-testid="`linked-${slug}`">
    <span class="position">{{ position }}.</span>
    <span class="title">{{ title }}</span>
    <code class="slug">{{ slug }}</code>
    <button
      type="button"
      class="row-btn"
      :disabled="!canMoveUp"
      :aria-label="`Move ${slug} up`"
      @click="$emit('up')"
    >
      ↑
    </button>
    <button
      type="button"
      class="row-btn"
      :disabled="!canMoveDown"
      :aria-label="`Move ${slug} down`"
      @click="$emit('down')"
    >
      ↓
    </button>
    <button
      type="button"
      class="row-btn row-remove"
      :aria-label="`Remove ${slug}`"
      :data-testid="`remove-${slug}`"
      @click="$emit('remove')"
    >
      ×
    </button>
  </li>
</template>

<style scoped>
.linked-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-soft);
  font-size: 0.875rem;
}

.position {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 1.5em;
}

.title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slug {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
}

.row-btn {
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
}

.row-btn:disabled {
  opacity: 40%;
  cursor: not-allowed;
}

.row-btn:hover:not(:disabled) {
  background: var(--color-background-mute);
}

.row-remove:hover:not(:disabled) {
  background: var(--color-error, #e53935);
  color: #fff;
  border-color: var(--color-error, #e53935);
}
</style>
