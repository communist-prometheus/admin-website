<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import type { Lang } from '@/stores/comms'
import { useCommsStore } from '@/stores/comms'
import { useCutoffStore } from '@/stores/cutoff'
import { useRunsStore } from '@/stores/runs'
import type { Schedule } from '@/stores/schedule'
import { useScheduleStore } from '@/stores/schedule'
import AddSubscriberForm from './AddSubscriberForm.vue'
import CommsSection from './CommsSection.vue'
import CutoffEditor from './CutoffEditor.vue'
import ForceDispatchPanel from './ForceDispatchPanel.vue'
import RunHistory from './RunHistory.vue'
import ScheduleEditor from './ScheduleEditor.vue'
import SubscribersTable from './SubscribersTable.vue'

const store = useCommsStore()
const schedule = useScheduleStore()
const cutoff = useCutoffStore()
const runs = useRunsStore()

const activeCount = computed(
  () => store.subscribers.filter(s => s.status === 'active').length
)

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

const onDispatched = (): void => {
  void runs.load()
  void cutoff.load()
}

const onCutoffSave = (next: string | null): void => {
  void cutoff.save(next)
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
        <h1 id="comms-title" class="title">Рассылка</h1>
        <p class="lead">
          Подписчики получают дайджест новых статей на выбранных ими
          языках. Расписание и отсечка — общие для всех.
        </p>
      </header>
      <CommsSection
        title="Расписание"
        lead="Cron-выражение + IANA-таймзона. Сохранённое значение запускает диспетчер."
      >
        <ScheduleEditor
          :schedule="schedule.schedule"
          :saving="schedule.saving"
          :error="schedule.error"
          @save="onScheduleSave"
        />
      </CommsSection>
      <CommsSection
        title="Отсечка времени"
        lead="Единый «момент последнего запуска» для всех подписчиков. Статьи, опубликованные после неё, считаются новыми. Автодвигается после каждой успешной отправки, можно сдвинуть вручную."
      >
        <CutoffEditor
          :at="cutoff.at"
          :saving="cutoff.saving"
          :error="cutoff.error"
          @save="onCutoffSave"
        />
      </CommsSection>
      <CommsSection
        title="Подписчики"
        lead="Каждая строка получает дайджест на выбранных ей языках."
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
        title="Тестовая отправка"
        lead="Только для владельцев — запускает диспетчер немедленно для проверки. Сохранённое расписание не сдвигается."
      >
        <ForceDispatchPanel
          :active-count="activeCount"
          @dispatched="onDispatched"
        />
      </CommsSection>
      <CommsSection
        title="История отправок"
        lead="Последние двадцать попыток. Нажми на строку с ошибкой, чтобы развернуть текст ошибки."
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
