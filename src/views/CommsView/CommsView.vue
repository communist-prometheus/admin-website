<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'
import type { Lang } from '@/stores/comms'
import { useCommsStore } from '@/stores/comms'
import { useRunsStore } from '@/stores/runs'
import type { Schedule } from '@/stores/schedule'
import { useScheduleStore } from '@/stores/schedule'
import AddSubscriberForm from './AddSubscriberForm.vue'
import CommsSection from './CommsSection.vue'
import RunHistory from './RunHistory.vue'
import ScheduleEditor from './ScheduleEditor.vue'
import SubscribersTable from './SubscribersTable.vue'

const store = useCommsStore()
const schedule = useScheduleStore()
const runs = useRunsStore()

const showRuns = ref(false)

onMounted(() => {
  void store.ensureLoaded()
  void schedule.ensureLoaded()
  void nextTick(() => {
    showRuns.value = true
    void runs.ensureLoaded()
  })
})

const onAdd = (email: string, langs: readonly Lang[]): void => {
  void store.add(email, langs)
}

const onLangs = (id: number, langs: readonly Lang[]): void => {
  void store.updateLangs(id, langs)
}

const onRemove = (id: number): void => {
  void store.remove(id)
}

const onScheduleSave = (next: Schedule): void => {
  void schedule.save(next)
}
</script>

<template>
  <AppLayout>
    <section
      class="comms"
      data-testid="comms-view"
      aria-labelledby="comms-title"
    >
      <header class="head">
        <h1 id="comms-title" class="title">Newsletter</h1>
        <p class="lead">
          Editor list — subscribers receive the weekly digest of new
          articles on the languages they pick.
        </p>
      </header>
      <CommsSection
        title="Schedule"
        lead="Crontab + IANA timezone; saved values trigger the dispatch loop."
      >
        <ScheduleEditor
          :schedule="schedule.schedule"
          :saving="schedule.saving"
          :error="schedule.error"
          @save="onScheduleSave"
        />
      </CommsSection>
      <CommsSection
        title="Subscribers"
        lead="Each row receives the digest in the languages it has selected."
      >
        <AddSubscriberForm :saving="store.saving" @add="onAdd" />
        <SubscribersTable
          :subscribers="store.subscribers"
          @langs="onLangs"
          @remove="onRemove"
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
        title="Run history"
        lead="Last twenty dispatch attempts. Click a failed row to read its error."
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
