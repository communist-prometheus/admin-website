<script setup lang="ts">
defineProps<{
  readonly title: string
  readonly target: string
}>()
defineEmits<{
  'update:title': [v: string]
  'update:target': [v: 'public-website' | 'admin']
}>()
</script>

<template>
  <input
    type="text"
    placeholder="Title"
    class="field"
    :value="title"
    data-testid="ticket-title"
    @input="
      $emit('update:title', ($event.target as HTMLInputElement).value)
    "
  />
  <select
    class="field"
    :value="target"
    @change="
      $emit('update:target', ($event.target as HTMLSelectElement).value as 'public-website' | 'admin')
    "
  >
    <option value="public-website">Public Website</option>
    <option value="admin">Admin Panel</option>
  </select>
</template>

<style scoped>
.field {
  display: block;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: inherit;
  box-sizing: border-box;
}
</style>
