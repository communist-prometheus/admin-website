<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import LinkDescriptionRow from './LinkDescriptionRow.vue'

defineProps<{
  readonly descriptions: Readonly<Record<string, string>>
  readonly languages: readonly LanguageEntry[]
}>()

defineEmits<{ update: [lang: string, value: string] }>()
</script>

<template>
  <ul class="descriptions">
    <LinkDescriptionRow
      v-for="l in languages"
      :key="l.code"
      :code="l.code"
      :value="descriptions[l.code] ?? ''"
      @input="$emit('update', l.code, $event)"
    />
  </ul>
</template>

<style scoped>
.descriptions {
  list-style: none;
  margin: 0.5rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
