<script setup lang="ts">
import type { Language } from '@/types/content'

defineProps<{
  title: string
  lang: Language
  showDelete?: boolean
}>()

const emit = defineEmits<{ delete: [] }>()
</script>

<template>
  <div class="item-header">
    <h3>{{ title }}</h3>
    <button
      v-if="showDelete"
      type="button"
      class="delete-btn"
      data-testid="delete-item-btn"
      aria-label="Delete"
      @click.stop="emit('delete')"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M5.5 2h5M2 4h12M6 7v4M10 7v4M3.5 4l.5 8.5a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5L12.5 4"
          stroke="currentColor"
          stroke-width="1.3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <span class="lang-badge">{{ lang }}</span>
  </div>
</template>

<style scoped>
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(0.5rem, 1vw, 1rem);
  margin-bottom: clamp(0.375rem, 1vw, 0.5rem);
}

h3 {
  margin: 0;
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 600;
  flex: 1;
}

.delete-btn {
  visibility: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: var(--color-error, #e53935);
    background: color-mix(
      in srgb,
      var(--color-error, #e53935) 10%,
      transparent
    );
  }
}

.lang-badge {
  padding: clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem);
  background: var(--color-background-soft);
  border-radius: var(--radius-sm);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  font-weight: 500;
  text-transform: uppercase;
}
</style>
