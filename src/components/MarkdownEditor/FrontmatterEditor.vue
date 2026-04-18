<script setup lang="ts">
import type { ContentType } from '@/types/content'
import FrontmatterField from './FrontmatterField.vue'
import { getFields } from './frontmatter-fields'

const props = defineProps<{
  readonly frontmatter: Record<string, unknown>
  readonly contentType: ContentType
  readonly slug?: string
}>()

const emit = defineEmits<{
  'update:frontmatter': [data: Record<string, unknown>]
}>()

const fields = () => getFields(props.contentType, props.slug)

const today = () => new Date().toISOString().slice(0, 10)

const handleFieldUpdate = (key: string, value: unknown) => {
  const updated = { ...props.frontmatter, [key]: value }
  if (key === 'published' && value === true && !updated.publishDate) {
    updated.publishDate = today()
  }
  emit('update:frontmatter', updated)
}
</script>

<template>
  <fieldset class="frontmatter-editor" data-testid="frontmatter-editor">
    <legend>Metadata</legend>
    <FrontmatterField
      v-for="field in fields()"
      :key="field.key"
      :field="field"
      :value="frontmatter[field.key]"
      @update="handleFieldUpdate(field.key, $event)"
    />
  </fieldset>
</template>

<style scoped>
.frontmatter-editor {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: clamp(0.75rem, 2vw, 1rem);
}

legend {
  font-weight: 600;
  font-size: clamp(0.875rem, 2vw, 1rem);
  padding: 0 clamp(0.25rem, 0.5vw, 0.5rem);
}
</style>
