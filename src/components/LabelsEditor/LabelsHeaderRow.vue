<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'

defineProps<{
  readonly languages: readonly LanguageEntry[]
}>()
</script>

<template>
  <tr class="label-header-row">
    <th>Key</th>
    <th
      v-for="lang in languages"
      :key="lang.code"
    >
      {{ lang.label }} ({{ lang.code }})
    </th>
    <th>Remove</th>
  </tr>
</template>

<style scoped>
th {
  text-align: left;
  padding: 0.375rem 0.5rem;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
}
</style>
