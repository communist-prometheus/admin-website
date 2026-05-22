<script setup lang="ts">
import type { LinkEntry } from '@/stores/links'
import type { LanguageEntry } from '@/stores/settings'
import type { LinkField } from './draft-ops'
import LinkCategorySelect from './LinkCategorySelect.vue'
import LinkDescriptions from './LinkDescriptions.vue'
import LinkRingToggle from './LinkRingToggle.vue'

defineProps<{
  readonly entry: LinkEntry
  readonly index: number
  readonly groups: readonly string[]
  readonly languages: readonly LanguageEntry[]
}>()

const emit = defineEmits<{
  field: [index: number, field: LinkField, value: string]
  ring: [index: number, value: boolean]
  description: [index: number, lang: string, value: string]
  remove: [index: number]
}>()

const onField = (index: number, field: LinkField, e: Event): void => {
  if (e.target instanceof HTMLInputElement)
    emit('field', index, field, e.target.value)
}
</script>

<template>
  <li class="link-row" data-testid="link-row">
    <input
      type="text" class="f-text f-url" :value="entry.url"
      placeholder="https://…" data-testid="link-url"
      @input="onField(index, 'url', $event)"
    />
    <input
      type="text" class="f-text f-name" :value="entry.name"
      placeholder="Name" data-testid="link-name"
      @input="onField(index, 'name', $event)"
    />
    <LinkCategorySelect
      :value="entry.category" :groups="groups"
      @change="emit('field', index, 'category', $event)"
    />
    <input
      type="text" class="f-text f-lang" :value="entry.siteLang"
      placeholder="lang" data-testid="link-sitelang"
      @input="onField(index, 'siteLang', $event)"
    />
    <LinkRingToggle
      :checked="entry.inRing"
      @change="emit('ring', index, $event)"
    />
    <button
      type="button" class="f-remove" data-testid="link-remove"
      @click="emit('remove', index)"
    >
      ✕
    </button>
    <LinkDescriptions
      :descriptions="entry.descriptions" :languages="languages"
      @update="(lang, value) => emit('description', index, lang, value)"
    />
  </li>
</template>

<style scoped>
.link-row {
  list-style: none;
  display: grid;
  grid-template-columns: 2fr 2fr auto auto auto auto;
  gap: 0.4rem;
  align-items: center;
  padding: 0.75rem 0;
  border-top: 1px solid var(--color-border);
}

.f-text {
  min-width: 0;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.8125rem;
}

.f-lang {
  width: 3.5rem;
}

.f-remove {
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 1rem;
}

.descriptions {
  grid-column: 1 / -1;
}
</style>
