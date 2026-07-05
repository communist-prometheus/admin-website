<script setup lang="ts">
import { computed } from 'vue'
import { useLabelsStore } from '@/stores/labels'
import { resolveLabel } from '@/stores/resolve-label'
import type { ContentItem } from '@/types/content'
import ItemHeader from './ItemHeader.vue'
import ItemMeta from './ItemMeta.vue'

const props = defineProps<{
  readonly item: ContentItem
  readonly selected: boolean
  readonly hideDelete?: boolean
  readonly deleting?: boolean
  readonly selectMode?: boolean
  readonly checked?: boolean
}>()

const emit = defineEmits<{ click: []; delete: [] }>()

const fm = computed(() => props.item.frontmatter)
const labelsStore = useLabelsStore()

const formattedDate = computed(() => {
  const date = fm.value.publishDate
  if (!date) return undefined
  const d = date instanceof Date ? date : new Date(String(date))
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d)
})

const category = computed(() => {
  const key = fm.value.category
  if (typeof key !== 'string') return undefined
  return resolveLabel(
    key,
    props.item.lang,
    labelsStore.labels
  )
})

const description = computed(() => {
  const v = fm.value.description
  return typeof v === 'string' ? v : undefined
})
</script>

<template>
  <article
    class="content-item"
    :class="{ selected, deleting, 'in-select': selectMode, checked }"
    :inert="deleting || undefined"
    data-testid="content-item"
    :data-path="item.path"
    :data-selected="checked ? 'true' : undefined"
    @click="emit('click')"
  >
    <ItemHeader
      :title="String(item.frontmatter.title ?? '')"
      :lang="item.lang"
      :show-delete="!hideDelete && !selectMode"
      :show-checkbox="selectMode ?? false"
      :checked="checked ?? false"
      @delete="emit('delete')"
    />
    <p
      v-if="description"
      class="item-description"
    >
      {{ description }}
    </p>
    <ItemMeta
      :date="formattedDate"
      :category="category"
    />
  </article>
</template>

<style scoped>
.content-item {
  /*
   * Card padding: bumped from clamp(0.75, 1) → clamp(1, 1.25) so the
   * inner text has breathing room. The old value put the description
   * hard against the card edge on 375 vw viewports.
   */
  padding: clamp(1rem, 2.5vw, 1.25rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-background);
  cursor: pointer;
  transition: all 0.2s ease;
}

/*
 * Optimistic-deletion fade. Mounted via :class="{ deleting }".
 * `inert` blocks pointer events so a half-faded row cannot
 * intercept clicks, but the surrounding list still scrolls and
 * other items remain fully interactive — that's what makes the
 * delete feel non-blocking.
 */
.content-item.deleting {
  pointer-events: none;
  animation: content-item-fade-out 320ms ease-out forwards;
}

@keyframes content-item-fade-out {
  0% {
    opacity: 100%;
    transform: translateX(0);
  }

  100% {
    opacity: 0%;
    transform: translateX(12px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .content-item.deleting {
    animation-duration: 0.01ms;
  }
}

.content-item.selected {
  background: var(--color-background-mute);
  border-color: var(--color-heading);
}

.content-item.in-select {
  cursor: default;
}

.content-item.checked {
  background: color-mix(
    in srgb,
    var(--color-accent) 12%,
    var(--color-background)
  );
  border-color: var(--color-accent);
}

@media (hover: none) {
  .content-item :deep(.delete-btn) {
    visibility: visible;
  }
}

.content-item:hover {
  background: var(--color-background-soft);
  border-color: var(--color-heading);

  :deep(.delete-btn) {
    visibility: visible;
  }
}

.item-description {
  margin: 0 0 clamp(0.75rem, 2vw, 1rem);
  color: var(--color-text-secondary);

  /*
   * Slightly smaller than before (clamp 0.875-1rem → 0.85-0.95rem)
   * with a tighter line-height to lift density without shrinking the
   * whole card. Words stay legible on the smallest supported width.
   */
  font-size: clamp(0.85rem, 1.8vw, 0.95rem);
  line-height: 1.45;

  /*
   * Cap the description at two lines with the ellipsis pinned to the
   * end of the SECOND line. Without a line-clamp the paragraph
   * expanded to whatever the frontmatter shipped — 5-8 lines on some
   * blog posts — and the user reported "..." appearing "on a random
   * line" (that was actually a literal "..." in the frontmatter text
   * showing wherever it wrapped, mistaken for browser truncation).
   * The line-clamp guarantees the ONLY "..." in the card is the
   * browser's, always on line 2.
   */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

</style>
