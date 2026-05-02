<script setup lang="ts">
import ContentList from '@/components/ContentList/ContentList.vue'
import type { ContentItem, Language } from '@/types/content'

defineProps<{
  readonly items: readonly ContentItem[]
  readonly selectedLang: Language
  readonly isAuthenticated: boolean
  readonly loading?: boolean
  readonly hideCreate?: boolean
  readonly hideDelete?: boolean
  readonly deletingSlugs?: ReadonlySet<string>
  readonly selectMode?: boolean
  readonly selectedSlugs?: ReadonlySet<string>
}>()

const emit = defineEmits<{
  select: [item: ContentItem]
  create: []
  delete: [item: ContentItem]
  enterSelect: []
  exitSelect: []
  bulkDelete: []
  toggleSelect: [slug: string]
}>()
</script>

<template>
  <div class="view-content">
    <ContentList
      :items="items"
      :selected-lang="selectedLang"
      :selected-path="null"
      :loading="loading"
      :hide-create="hideCreate"
      :hide-delete="hideDelete"
      :deleting-slugs="deletingSlugs"
      :select-mode="selectMode"
      :selected-slugs="selectedSlugs"
      @select="emit('select', $event)"
      @create="isAuthenticated ? emit('create') : undefined"
      @delete="emit('delete', $event)"
      @enter-select="emit('enterSelect')"
      @exit-select="emit('exitSelect')"
      @bulk-delete="emit('bulkDelete')"
      @toggle-select="emit('toggleSelect', $event)"
    />
    <p v-if="!isAuthenticated" class="auth-required">
      Please log in to edit content
    </p>
  </div>
</template>

<style scoped>
.view-content {
  padding: var(--content-frame-padding);
  max-width: var(--content-medium);
  width: 100%;
  margin-inline: auto;
  flex: 1;
  overflow: auto;
}

.auth-required {
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 2vw, 1.25rem);
  text-align: center;
  margin-top: 2rem;
}
</style>
