<script setup lang="ts">
import EditableSlug from '@/components/common/EditableSlug.vue'
import type { ContentType } from '@/types/content'

defineProps<{
  readonly contentType: ContentType
  readonly slug: string
  readonly renameable: boolean
}>()

defineEmits<{ rename: [newSlug: string] }>()
</script>

<template>
  <nav class="breadcrumb">
    <RouterLink
      :to="`/content/${contentType}`"
      class="back-link"
      data-testid="back-button"
    >
      &larr; {{ contentType }}
    </RouterLink>
    <span class="sep">|</span>
    <EditableSlug
      v-if="renameable"
      :slug="slug"
      @rename="$emit('rename', $event)"
    />
    <span
      v-else
      class="slug-text"
      data-testid="slug-title"
    >{{ slug }}</span>
  </nav>
</template>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  overflow: hidden;
}

.back-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  flex-shrink: 0;

  &:hover {
    color: var(--color-text);
  }
}

.sep {
  flex-shrink: 0;
}

.slug-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
