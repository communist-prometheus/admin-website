<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { t } from '@/i18n/t'
import { useCommsStore } from '@/stores/comms'
import { useCutoffStore } from '@/stores/cutoff'
import { useRunsStore } from '@/stores/runs'
import { useScheduleStore } from '@/stores/schedule'
import CommsSection from '../CommsSection.vue'
import CutoffEditor from '../CutoffEditor.vue'
import ForceDispatchPanel from '../ForceDispatchPanel.vue'
import { buildHandlers } from '../handlers'
import ScheduleEditor from '../ScheduleEditor.vue'

const store = useCommsStore()
const schedule = useScheduleStore()
const cutoff = useCutoffStore()
const runs = useRunsStore()
const h = buildHandlers({ comms: store, schedule, cutoff, runs })

const activeSubscribers = computed(() =>
  store.subscribers.filter(s => s.status === 'active')
)

onMounted(() => {
  void schedule.ensureLoaded()
  void cutoff.ensureLoaded()
  /* The test-dispatch picker needs the list even on this tab. */
  void store.ensureLoaded()
})
</script>

<template>
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
    :title="t('comms.testDispatch.title')"
    :lead="t('comms.testDispatch.lead')"
  >
    <ForceDispatchPanel
      :subscribers="activeSubscribers"
      @dispatched="h.onDispatched"
    />
  </CommsSection>
</template>
