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
  <RouterLink
    :to="`/content/${contentType}`"
    class="back-link"
    data-testid="back-button"
  >
    &larr; {{ contentType }}
  </RouterLink>
  |
  <EditableSlug
    v-if="renameable"
    :slug="slug"
    @rename="$emit('rename', $event)"
  />
  <span v-else data-testid="slug-title">{{ slug }}</span>
</template>

<style scoped>
.back-link {
  color: var(--color-text-secondary);
  text-decoration: none;

  &:hover {
    color: var(--color-text);
  }
}
</style>
