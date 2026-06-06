<script setup lang="ts">
import { onMounted } from 'vue'
import type { Lang } from '@/stores/comms'
import { useCommsStore } from '@/stores/comms'
import type { Schedule } from '@/stores/schedule'
import { useScheduleStore } from '@/stores/schedule'
import AddSubscriberForm from './AddSubscriberForm.vue'
import ScheduleEditor from './ScheduleEditor.vue'
import SubscribersTable from './SubscribersTable.vue'

const store = useCommsStore()
const schedule = useScheduleStore()

onMounted(() => {
  void store.ensureLoaded()
  void schedule.ensureLoaded()
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
  <section class="comms" data-testid="comms-view">
    <h1 class="title">Newsletter</h1>
    <p class="lead">
      Editor list — subscribers receive the weekly digest of new
      articles on the languages they pick.
    </p>
    <ScheduleEditor
      :schedule="schedule.schedule"
      :saving="schedule.saving"
      :error="schedule.error"
      @save="onScheduleSave"
    />
    <AddSubscriberForm :saving="store.saving" @add="onAdd" />
    <SubscribersTable
      :subscribers="store.subscribers"
      @langs="onLangs"
      @remove="onRemove"
    />
    <p v-if="store.loading && store.subscribers.length === 0" data-testid="comms-loading">
      Loading…
    </p>
  </section>
</template>

<style scoped>
.comms {
  max-width: 920px;
  padding: 1.25rem;
}

.title {
  margin: 0 0 0.25rem;
}

.lead {
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0;
}
</style>
