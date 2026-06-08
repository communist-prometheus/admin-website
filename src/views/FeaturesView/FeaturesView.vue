<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { t } from '@/i18n/t'
import { useFeaturesStore } from '@/stores/features'
import type { FeatureFlags } from '@/stores/features-api'

const store = useFeaturesStore()
const draft = ref<FeatureFlags>({ webring: false })

onMounted(() => {
  void store.ensureLoaded()
})

watch(
  () => store.flags,
  next => {
    draft.value = { ...next }
  },
  { deep: true, immediate: true }
)

const isDirty = computed(
  () => draft.value.webring !== store.flags.webring
)

const onSave = (): void => {
  void store.save({ ...draft.value })
}
</script>

<template>
  <AppLayout>
    <section
      class="features"
      data-testid="features-view"
      aria-labelledby="features-title"
    >
      <header class="head">
        <h1 id="features-title" class="title">
          {{ t('features.title') }}
        </h1>
        <p class="lead">{{ t('features.lead') }}</p>
      </header>

      <form class="flags" @submit.prevent="onSave">
        <label class="flag" data-testid="feature-webring">
          <input
            v-model="draft.webring"
            type="checkbox"
            class="flag-toggle"
            data-testid="feature-webring-toggle"
            :disabled="store.saving"
          />
          <span class="flag-text">
            <span class="flag-name">{{ t('features.webring.title') }}</span>
            <span class="flag-desc">{{ t('features.webring.desc') }}</span>
          </span>
        </label>

        <div class="actions">
          <button
            type="submit"
            class="btn btn-primary"
            data-testid="features-save"
            :disabled="store.saving || !isDirty"
          >
            {{ store.saving ? t('features.saving') : t('features.save') }}
          </button>
          <p
            v-if="store.loading"
            class="status"
            role="status"
            data-testid="features-loading"
          >
            {{ t('features.loading') }}
          </p>
          <p
            v-if="store.error"
            class="error"
            role="alert"
            data-testid="features-error"
          >
            {{ store.error }}
          </p>
        </div>
      </form>
    </section>
  </AppLayout>
</template>

<style scoped>
.features {
  max-width: var(--content-narrow);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--content-frame-padding) var(--spacing-2xl);
  display: grid;
  gap: var(--spacing-lg);
}

.head {
  display: grid;
  gap: var(--spacing-xs);
}

.title {
  margin: 0;
  font-weight: 700;
  font-size: 1.75rem;
  color: var(--color-text-primary);
}

.lead {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.flags {
  display: grid;
  gap: var(--spacing-md);
}

.flag {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--spacing-sm);
  align-items: start;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-elevated);
  cursor: pointer;
}

.flag:hover {
  border-color: var(--color-text-secondary);
}

.flag-toggle {
  appearance: auto;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.15rem;
  accent-color: var(--color-accent);
  cursor: pointer;
}

.flag-text {
  display: grid;
  gap: 0.2rem;
}

.flag-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
}

.flag-desc {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  line-height: 1.4;
}

.actions {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font: 600 0.95rem/1 var(--font-sans);
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: var(--color-accent);
  color: var(--color-background);
  border-color: var(--color-accent);
}

.btn-primary:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.btn-primary:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.status,
.error {
  margin: 0;
  font-size: 0.8125rem;
}

.status {
  color: var(--color-text-secondary);
}

.error {
  color: var(--color-danger);
}

@media (width < 640px) {
  .btn-primary {
    width: 100%;
  }
}
</style>
