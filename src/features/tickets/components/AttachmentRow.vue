<script setup lang="ts">
defineProps<{ readonly id: string; readonly name: string }>()
defineEmits<{ remove: [id: string] }>()
</script>

<template>
  <li class="att-row">
    <span class="att-name">{{ name }}</span>
    <button
      type="button"
      class="att-remove"
      :aria-label="`Remove ${name}`"
      @click="$emit('remove', id)"
    >
      ×
    </button>
  </li>
</template>

<style scoped>
.att-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--color-background-soft);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
}

.att-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.att-remove {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
</style>
