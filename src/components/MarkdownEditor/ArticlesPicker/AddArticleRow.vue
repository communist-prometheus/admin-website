<script setup lang="ts">
import { ref } from 'vue'
import type { ArticleOption } from './article-options'

defineProps<{
  readonly options: readonly ArticleOption[]
}>()

const emit = defineEmits<{
  add: [slug: string]
}>()

const selected = ref('')

const onClick = (): void => {
  const slug = selected.value
  if (slug === '') return
  emit('add', slug)
  selected.value = ''
}
</script>

<template>
  <div class="add-row">
    <select
      v-model="selected"
      class="select"
      data-testid="article-add-select"
    >
      <option value="" disabled>Pick an article…</option>
      <option v-for="opt in options" :key="opt.slug" :value="opt.slug">
        {{ opt.title }}
      </option>
    </select>
    <button
      type="button"
      class="add-btn"
      :disabled="selected === ''"
      data-testid="article-add"
      @click="onClick"
    >
      Add
    </button>
  </div>
</template>

<style scoped>
.add-row {
  /*
   * On mobile the MobileMenu FAB (fixed, bottom-right, ~56px) would
   * otherwise sit on top of the Add button when the picker happens
   * to align with the viewport bottom — observed regression on
   * /content/newspaper/edit at 375px. `--fab-safe-inline-end`
   * resolves to 0 on desktop (FAB hidden) and the FAB gutter on
   * narrow screens.
   */
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding-inline-end: var(--fab-safe-inline-end);
}

.select {
  flex: 1 1 12rem;
  min-width: 0;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

.add-btn {
  flex: 0 0 auto;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-accent, #1976d2);
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
}

.add-btn:disabled {
  opacity: 40%;
  cursor: not-allowed;
}
</style>
