<script setup lang="ts">
import type { LanguageEntry } from '@/stores/settings'
import type { TopicEntry } from '@/stores/topics'
import TopicColorInput from './TopicColorInput.vue'
import TopicKeyInput from './TopicKeyInput.vue'
import TopicLangCell from './TopicLangCell.vue'
import TopicRemoveButton from './TopicRemoveButton.vue'

const props = defineProps<{
  readonly entry: TopicEntry
  readonly languages: readonly LanguageEntry[]
}>()

const emit = defineEmits<{
  'update-key': [value: string]
  'update-color': [value: string]
  'update-name': [lang: string, value: string]
  'update-subtitle': [lang: string, value: string]
  'update-description': [lang: string, value: string]
  remove: []
}>()
</script>

<template>
  <tr data-testid="topic-row">
    <TopicKeyInput
      :value="props.entry.key"
      @input="emit('update-key', $event)"
    />
    <TopicColorInput
      :value="props.entry.color"
      @input="emit('update-color', $event)"
    />
    <TopicLangCell
      v-for="lang in props.languages"
      :key="lang.code"
      :name="props.entry.name[lang.code] ?? ''"
      :subtitle="props.entry.subtitle[lang.code] ?? ''"
      :description="props.entry.description[lang.code] ?? ''"
      :lang-code="lang.code"
      :lang-label="lang.label"
      @update-name="emit('update-name', lang.code, $event)"
      @update-subtitle="emit('update-subtitle', lang.code, $event)"
      @update-description="emit('update-description', lang.code, $event)"
    />
    <TopicRemoveButton @click="emit('remove')" />
  </tr>
</template>
