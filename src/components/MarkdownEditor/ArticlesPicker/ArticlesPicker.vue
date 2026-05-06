<script setup lang="ts">
import { computed } from 'vue'
import { useContentStore } from '@/stores/content'
import type { ContentItem } from '@/types/content'
import type { Language } from '@/types/language'
import AddArticleRow from './AddArticleRow.vue'
import { articleOptions } from './article-options'
import LinkedArticleRow from './LinkedArticleRow.vue'
import { moveDown, moveUp, removeAt } from './reorder'

const props = defineProps<{
  readonly value: readonly string[] | undefined
  readonly lang: Language
}>()

const emit = defineEmits<{
  update: [value: readonly string[]]
}>()

const store = useContentStore()
const blog = store.itemsByType('blog')

const linked = computed<readonly string[]>(() => props.value ?? [])

type Entry = readonly [slug: string, title: string]

const toEntry = (item: ContentItem): Entry => {
  const t = item.frontmatter['title']
  const title = typeof t === 'string' && t.trim() !== '' ? t : ''
  return [item.slug, title]
}

const titleBySlug = computed(() => {
  const entries: readonly Entry[] = blog.value
    .filter(item => item.lang === props.lang)
    .map(toEntry)
    .filter(([, title]) => title !== '')
  return new Map<string, string>(entries)
})

const labelFor = (slug: string): string =>
  titleBySlug.value.get(slug) ?? slug

const options = computed(() =>
  articleOptions({
    items: blog.value,
    lang: props.lang,
    exclude: linked.value,
  })
)
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
