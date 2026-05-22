<script setup lang="ts">
defineProps<{
  readonly value: string
  readonly groups: readonly string[]
}>()

const emit = defineEmits<{ change: [value: string] }>()

const onChange = (e: Event): void => {
  if (e.target instanceof HTMLSelectElement) emit('change', e.target.value)
}
</script>

<template>
  <select
    class="f-cat"
    :value="value"
    data-testid="link-category"
    @change="onChange"
  >
    <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
  </select>
</template>

<style scoped>
.f-cat {
  min-width: 0;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.8125rem;
}
</style>
