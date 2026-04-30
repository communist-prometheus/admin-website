<script setup lang="ts">
import { CONFLICT_TEST_IDS } from './test-ids'

defineProps<{ readonly hasConflict: boolean }>()
defineEmits<{ readonly resolveAll: [] }>()
</script>

<template>
  <header class="head">
    <strong class="title">Merge conflicts</strong>
    <button
      v-if="hasConflict"
      type="button"
      class="resolve-all"
      :data-testid="CONFLICT_TEST_IDS.resolveAll"
      @click="$emit('resolveAll')"
    >
      Mark all resolved
    </button>
  </header>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 1.25rem;
}

.resolve-all {
  font-size: 0.8125rem;
  padding: 4px 10px;
  background: transparent;
  border: 1px solid var(--color-border, #ddd);
  border-radius: 4px;
  cursor: pointer;
}
</style>
