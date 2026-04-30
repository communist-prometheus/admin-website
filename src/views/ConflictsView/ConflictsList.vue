<script setup lang="ts">
import ConflictItem from './ConflictItem.vue'
import { CONFLICT_TEST_IDS } from './test-ids'

defineProps<{ readonly files: ReadonlyArray<string> }>()
</script>

<template>
  <ul class="conflicts-list" :data-testid="CONFLICT_TEST_IDS.list">
    <ConflictItem
      v-for="file in files"
      :key="file"
      :path="file"
    />
  </ul>
</template>

<style scoped>
.conflicts-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
