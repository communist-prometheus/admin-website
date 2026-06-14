<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { t } from '@/i18n/t'
import { type Subscriber, useCommsStore } from '@/stores/comms'
import { useCutoffStore } from '@/stores/cutoff'
import { useRunsStore } from '@/stores/runs'
import { useScheduleStore } from '@/stores/schedule'
import AddSubscriberForm from './AddSubscriberForm.vue'
import CommsSection from './CommsSection.vue'
import CutoffEditor from './CutoffEditor.vue'
import ForceDispatchPanel from './ForceDispatchPanel.vue'
import { buildHandlers } from './handlers'
import RemoveSubscriberDialog from './RemoveSubscriberDialog.vue'
import RunHistory from './RunHistory.vue'
import ScheduleEditor from './ScheduleEditor.vue'
import SubscribersTable from './SubscribersTable.vue'

const store = useCommsStore()
const schedule = useScheduleStore()
const cutoff = useCutoffStore()
const runs = useRunsStore()

const activeSubscribers = computed(() =>
  store.subscribers.filter(s => s.status === 'active')
)
const showRuns = ref(false)
const pendingRemove = ref<Subscriber | undefined>(undefined)
const h = buildHandlers({ comms: store, schedule, cutoff, runs })

const requestRemove = (id: number): void => {
  pendingRemove.value = store.subscribers.find(s => s.id === id)
}

const confirmRemove = (): void => {
  const target = pendingRemove.value
  pendingRemove.value = undefined
  if (target) h.onRemove(target.id)
}

const cancelRemove = (): void => {
  pendingRemove.value = undefined
}

onMounted(() => {
  void store.ensureLoaded()
  void schedule.ensureLoaded()
  void cutoff.ensureLoaded()
  void nextTick(() => {
    showRuns.value = true
    void runs.ensureLoaded()
  })
})
</script>

<template>
  <AppLayout>
    <section
      class="comms"
      data-testid="comms-view"
      aria-labelledby="comms-title"
    >
      <header class="head">
        <h1 id="comms-title" class="title">{{ t('comms.title') }}</h1>
        <p class="lead">{{ t('comms.lead') }}</p>
      </header>
      <CommsSection
        :title="t('comms.schedule.title')"
        :lead="t('comms.schedule.lead')"
      >
        <ScheduleEditor
          :schedule="schedule.schedule"
          :saving="schedule.saving"
          :error="schedule.error"
          @save="h.onScheduleSave"
        />
      </CommsSection>
      <CommsSection
        :title="t('comms.cutoff.title')"
        :lead="t('comms.cutoff.lead')"
      >
        <CutoffEditor
          :at="cutoff.at"
          :saving="cutoff.saving"
          :error="cutoff.error"
          @save="h.onCutoffSave"
        />
      </CommsSection>
      <CommsSection
        :title="t('comms.subscribers.title')"
        :lead="t('comms.subscribers.lead')"
      >
        <AddSubscriberForm :saving="store.saving" @add="h.onAdd" />
        <SubscribersTable
          :subscribers="store.subscribers"
          @langs="h.onLangs"
          @remove="requestRemove"
        />
        <p
          v-if="store.loading && store.subscribers.length === 0"
          class="loading"
          role="status"
          data-testid="comms-loading"
        >
          Loading…
        </p>
      </CommsSection>
      <CommsSection
        :title="t('comms.testDispatch.title')"
        :lead="t('comms.testDispatch.lead')"
      >
        <ForceDispatchPanel
          :subscribers="activeSubscribers"
          @dispatched="h.onDispatched"
        />
      </CommsSection>
      <CommsSection
        :title="t('comms.runHistory.title')"
        :lead="t('comms.runHistory.lead')"
      >
        <RunHistory
          v-if="showRuns"
          :runs="runs.runs"
          :loading="runs.loading"
          :error="runs.error"
        />
        <p
          v-else
          class="loading"
          role="status"
          data-testid="run-history-skeleton"
        >
          Loading run history…
        </p>
      </CommsSection>
      <RemoveSubscriberDialog
        :email="pendingRemove?.email"
        @confirm="confirmRemove"
        @cancel="cancelRemove"
      />
    </section>
  </AppLayout>
</template>

<style scoped>
.comms {
  max-width: var(--content-medium);
  margin: 0 auto;
  padding: var(--spacing-lg) var(--content-frame-padding) var(--spacing-2xl);
  display: grid;
  gap: var(--spacing-xl);
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
  color: var(--color-text-secondary);
  margin: 0;
  font-size: 0.95rem;
}

.loading {
  margin: 0;
  padding: var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
