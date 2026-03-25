<script setup lang="ts">
import EditableSlug from '@/components/common/EditableSlug.vue'
import type { ContentType } from '@/types/content'

defineProps<{
  readonly slug: string
  readonly contentType: ContentType
  readonly renameable?: boolean
}>()

defineEmits<{
  rename: [newSlug: string]
}>()
</script>

<template>
  <nav class="edit-header-left">
    <RouterLink
      :to="`/content/${contentType}`"
      class="back-link"
      data-testid="back-button"
    >
      &larr; Back
    </RouterLink>
    <EditableSlug
      v-if="renameable !== false"
      :slug="slug"
      @rename="$emit('rename', $event)"
    />
    <h1 v-else data-testid="slug-title">{{ slug }}</h1>
  </nav>
</template>

<style scoped>
.edit-header-left {
  display: flex;
  align-items: center;
  gap: clamp(0.5rem, 1vw, 1rem);
}

.back-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: clamp(0.875rem, 2vw, 1rem);

  &:hover {
    color: var(--color-text);
  }
}

h1 {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
</style>
