<script setup lang="ts">
import { onMounted } from 'vue'
import { t } from '@/i18n/t'
import { useRunsStore } from '@/stores/runs'
import CommsSection from '../CommsSection.vue'
import RetryFailedPanel from '../RetryFailedPanel.vue'
import RunHistory from '../RunHistory.vue'

const runs = useRunsStore()

const onDispatched = (): void => {
  void runs.load()
}

onMounted(() => {
  void runs.ensureLoaded()
})
</script>

<template>
  <CommsSection
    :title="t('comms.retryFailed.title')"
    :lead="t('comms.retryFailed.lead')"
  >
    <RetryFailedPanel @dispatched="onDispatched" />
  </CommsSection>
  <CommsSection
    :title="t('comms.runHistory.title')"
    :lead="t('comms.runHistory.lead')"
  >
    <RunHistory
      :runs="runs.runs"
      :loading="runs.loading"
      :error="runs.error"
    />
    <button
      v-if="runs.canLoadMore"
      type="button"
      class="load-more"
      data-testid="run-history-more"
      :disabled="runs.loading"
      @click="runs.loadMore()"
    >
      {{
        runs.loading
          ? t('comms.runHistory.loading')
          : t('comms.runHistory.more')
      }}
    </button>
  </CommsSection>
</template>

<style scoped>
.load-more {
  margin-block-start: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  font-size: 0.875rem;
  cursor: pointer;
}

.load-more:disabled {
  opacity: 60%;
  cursor: default;
}

.load-more:hover:not(:disabled) {
  background: var(--color-surface-hover);
}
</style>
