<script setup lang="ts">
defineProps<{
  readonly stepName: string
  readonly canReload: boolean
}>()

defineEmits<{ reload: [] }>()
</script>

<template>
  <header class="error-log-head">
    <h2>Failure in step: {{ stepName }}</h2>
    <button
      v-if="canReload"
      type="button"
      class="reload"
      @click="$emit('reload')"
    >
      Reload log
    </button>
  </header>
</template>

<style scoped>
.error-log-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

h2 {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text);
}

.reload {
  padding: 0.25rem 0.625rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.8125rem;
}
</style>
