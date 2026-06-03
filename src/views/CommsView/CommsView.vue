<script setup lang="ts">
import { onMounted } from 'vue'
import type { Lang } from '@/stores/comms'
import { useCommsStore } from '@/stores/comms'
import AddSubscriberForm from './AddSubscriberForm.vue'
import SubscribersTable from './SubscribersTable.vue'

const store = useCommsStore()

onMounted(() => {
  void store.ensureLoaded()
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
</script>

<template>
  <section class="comms" data-testid="comms-view">
    <header class="head">
      <h1>Newsletter</h1>
      <p class="lead">
        Editor list — subscribers receive the weekly digest of new
        articles on the languages they pick.
      </p>
    </header>
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

.head {
  margin-bottom: 1rem;
}

.lead {
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0;
}
</style>
