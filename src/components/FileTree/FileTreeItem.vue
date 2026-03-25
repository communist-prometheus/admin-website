<script setup lang="ts">
import type { SWTreeItem } from '@/validation/schemas/sw-api'

const props = defineProps<{
  readonly item: SWTreeItem
  readonly isSelected: boolean
}>()

defineEmits<{
  select: [path: string]
}>()

const icon = props.item.type === 'tree' ? '📁' : '📄'
const name = props.item.path.split('/').pop() || ''
</script>

<template>
  <button
    type="button"
    :class="{ selected: isSelected }"
    @click="$emit('select', item.path)"
  >
    {{ icon }} {{ name }}
  </button>
</template>

<style scoped>
button {
  display: block;
  width: 100%;
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(0.75rem, 2vw, 1rem);
  border: none;
  background: transparent;
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
  transition: background var(--transition-fast);
  font-size: clamp(0.875rem, 2vw, 1rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

button:hover {
  background: var(--color-background-mute);
}

.selected {
  background: var(--color-border);
  font-weight: 600;
}
</style>
