<script setup lang="ts">
defineProps<{
  readonly label: string
  readonly title: string
  readonly testId?: string
}>()

defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    :title="title"
    :data-testid="testId"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
button {
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
}

button:disabled {
  opacity: 40%;
  cursor: default;
}

button:hover:not(:disabled) {
  background: var(--color-background);
}
</style>
