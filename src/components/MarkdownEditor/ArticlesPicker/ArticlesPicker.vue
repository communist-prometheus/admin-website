<script setup lang="ts">
import { computed } from 'vue'
import { useContentStore } from '@/stores/content'
import AddArticleRow from './AddArticleRow.vue'
import { articleOptions } from './article-options'
import LinkedArticleRow from './LinkedArticleRow.vue'
import { moveDown, moveUp, removeAt } from './reorder'

const props = defineProps<{
  readonly value: readonly string[] | undefined
}>()

const emit = defineEmits<{
  update: [value: readonly string[]]
}>()

const store = useContentStore()
const blog = store.itemsByType('blog')

const linked = computed<readonly string[]>(() => props.value ?? [])

const titleBySlug = computed(() => {
  const map = new Map<string, string>()
  for (const item of blog.value) {
    const t = item.frontmatter['title']
    if (typeof t === 'string' && t.trim() !== '') map.set(item.slug, t)
  }
  return map
})

const labelFor = (slug: string): string =>
  titleBySlug.value.get(slug) ?? slug

const options = computed(() => articleOptions(blog.value, linked.value))
</script>

<template>
  <ol class="linked" data-testid="articles-picker">
    <LinkedArticleRow
      v-for="(slug, i) in linked"
      :key="slug"
      :slug="slug"
      :title="labelFor(slug)"
      :position="i + 1"
      :can-move-up="i > 0"
      :can-move-down="i < linked.length - 1"
      @up="emit('update', moveUp(linked, i))"
      @down="emit('update', moveDown(linked, i))"
      @remove="emit('update', removeAt(linked, i))"
    />
  </ol>
  <p v-if="linked.length === 0" class="empty">
    No articles linked yet — pick from below.
  </p>
  <AddArticleRow
    :options="options"
    @add="emit('update', [...linked, $event])"
  />
</template>

<style scoped>
.articles-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.linked {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.empty {
  margin: 0;
  padding: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-style: italic;
}
</style>
