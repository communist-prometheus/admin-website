<script setup lang="ts">
import { onMounted } from 'vue'
import { t } from '@/i18n/t'
import { useCommsStore } from '@/stores/comms'
import { useCutoffStore } from '@/stores/cutoff'
import { useRunsStore } from '@/stores/runs'
import { useScheduleStore } from '@/stores/schedule'
import AddSubscriberForm from '../AddSubscriberForm.vue'
import CommsSection from '../CommsSection.vue'
import { buildHandlers } from '../handlers'
import RemoveSubscriberDialog from '../RemoveSubscriberDialog.vue'
import StatusFilter from '../StatusFilter.vue'
import StatusLegend from '../StatusLegend.vue'
import SubscribersTable from '../SubscribersTable.vue'
import { useRemoveDialog } from '../use-remove-dialog'
import { useStatusFilter } from '../use-status-filter'

const store = useCommsStore()
const h = buildHandlers({
  comms: store,
  schedule: useScheduleStore(),
  cutoff: useCutoffStore(),
  runs: useRunsStore(),
})

const {
  statusFilter,
  counts: statusCounts,
  visible: visibleSubscribers,
  setStatusFilter,
} = useStatusFilter(() => store.subscribers)
const { pendingRemove, requestRemove, confirmRemove, cancelRemove } =
  useRemoveDialog(() => store.subscribers, h.onRemove)

onMounted(() => {
  void store.ensureLoaded()
})
</script>

<template>
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
      @last-sent="h.onLastSent"
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
      v-else-if="
        visibleSubscribers.length === 0 && store.subscribers.length > 0
      "
      class="loading"
      role="status"
      data-testid="comms-empty-filter"
    >
      No subscribers with this status.
    </p>
  </CommsSection>
  <RemoveSubscriberDialog
    :email="pendingRemove?.email"
    @confirm="confirmRemove"
    @cancel="cancelRemove"
  />
</template>

<style scoped>
.loading {
  margin: 0;
  padding: var(--spacing-sm) 0;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
