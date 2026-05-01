<script setup lang="ts">
defineProps<{
  readonly selectMode?: boolean
  readonly selectedCount?: number
}>()

defineEmits<{
  create: []
  enterSelect: []
  exitSelect: []
  bulkDelete: []
}>()
</script>

<template>
  <template v-if="selectMode">
    <span class="count" data-testid="bulk-count">
      {{ selectedCount ?? 0 }} selected
    </span>
    <button
      type="button"
      class="btn btn-secondary"
      data-testid="bulk-cancel"
      @click="$emit('exitSelect')"
    >
      Cancel
    </button>
    <button
      type="button"
      class="btn btn-danger"
      :disabled="(selectedCount ?? 0) === 0"
      data-testid="bulk-delete"
      @click="$emit('bulkDelete')"
    >
      Delete selected
    </button>
  </template>
  <template v-else>
    <button
      type="button"
      class="btn btn-secondary"
      data-testid="select-mode"
      @click="$emit('enterSelect')"
    >
      Select
    </button>
    <button
      type="button"
      class="btn btn-primary"
      data-testid="create-button"
      @click="$emit('create')"
    >
      + New
    </button>
  </template>
</template>

<style scoped>
.count {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.btn {
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem);
  border: none;
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-heading);
  color: var(--color-background);
}

.btn-primary:not(:disabled):hover {
  opacity: 90%;
}

.btn-secondary {
  background: var(--color-background-soft);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.btn-secondary:not(:disabled):hover {
  background: var(--color-background-mute);
}

.btn-danger {
  background: var(--color-error, #e53935);
  color: #fff;
}

.btn-danger:not(:disabled):hover {
  opacity: 90%;
}
</style>
