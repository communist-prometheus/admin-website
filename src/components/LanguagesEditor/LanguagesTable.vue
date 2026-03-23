<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import LanguageRow from './LanguageRow.vue'

defineProps<{
  readonly languages: readonly LanguageEntry[]
}>()

defineEmits<{
  'update:code': [index: number, value: string]
  'update:label': [index: number, value: string]
  remove: [index: number]
}>()
</script>

<template>
  <table class="lang-table" data-testid="languages-table">
    <LanguageRow
      v-for="(entry, index) in languages"
      :key="index"
      :entry="entry"
      @update:code="$emit('update:code', index, $event)"
      @update:label="$emit('update:label', index, $event)"
      @remove="$emit('remove', index)"
    />
  </table>
</template>

<style scoped>
.lang-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
}
</style>
