<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { t } from '@/i18n/t'
import { useCommsStore } from '@/stores/comms'
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
import StatusFilter from './StatusFilter.vue'
import StatusLegend from './StatusLegend.vue'
import SubscribersTable from './SubscribersTable.vue'
import { useRemoveDialog } from './use-remove-dialog'
import { useStatusFilter } from './use-status-filter'

const store = useCommsStore()
const schedule = useScheduleStore()
const cutoff = useCutoffStore()
const runs = useRunsStore()
const h = buildHandlers({ comms: store, schedule, cutoff, runs })

const activeSubscribers = computed(() =>
  store.subscribers.filter(s => s.status === 'active')
)
const {
  statusFilter,
  counts: statusCounts,
  visible: visibleSubscribers,
  setStatusFilter,
} = useStatusFilter(() => store.subscribers)
const { pendingRemove, requestRemove, confirmRemove, cancelRemove } =
  useRemoveDialog(() => store.subscribers, h.onRemove)

const showRuns = ref(false)

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
        <StatusLegend />
        <StatusFilter
          :model-value="statusFilter"
          :counts="statusCounts"
          :total="store.subscribers.length"
          @update:model-value="setStatusFilter"
        />
        <SubscribersTable
          :subscribers="visibleSubscribers"
          @langs="h.onLangs"
          @message-lang="h.onMessageLang"
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
        <p
          v-else-if="visibleSubscribers.length === 0 && store.subscribers.length > 0"
          class="loading"
          role="status"
          data-testid="comms-empty-filter"
        >
          No subscribers with this status.
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
