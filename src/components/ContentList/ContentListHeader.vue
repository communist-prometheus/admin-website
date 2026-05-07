<script setup lang="ts">
import ListHeaderActions from './ListHeaderActions.vue'

defineProps<{
  readonly selectMode?: boolean
  readonly selectedCount?: number
  readonly hasItems?: boolean
}>()

defineEmits<{
  create: []
  enterSelect: []
  exitSelect: []
  bulkDelete: []
}>()
</script>

<template>
  <header class="list-header">
    <h2>Content Files</h2>
    <ListHeaderActions
      :select-mode="selectMode"
      :selected-count="selectedCount"
      :has-items="hasItems"
      @create="$emit('create')"
      @enter-select="$emit('enterSelect')"
      @exit-select="$emit('exitSelect')"
      @bulk-delete="$emit('bulkDelete')"
    />
  </header>
</template>

<style scoped>
.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(0.75rem, 2vw, 1rem);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  background: var(--color-background);
  z-index: 1;
  gap: 0.75rem;
  flex-wrap: wrap;
}

h2 {
  margin: 0;
  font-size: clamp(1.125rem, 2.5vw, 1.5rem);
  font-weight: 600;
}
</style>
