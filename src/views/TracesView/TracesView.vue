<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTraceDetail } from '@/composables/useTraceDetail/use-trace-detail'
import type { SearchFilters } from '@/composables/useTraceSearch/search-types'
import { useSavedQueries } from '@/composables/useTraceSearch/use-saved-queries'
import { useTraceSearch } from '@/composables/useTraceSearch/use-trace-search'
import SavedQueriesBar from './SavedQueriesBar.vue'
import SearchForm from './SearchForm.vue'
import { buildSavedHandlers } from './saved-handlers'
import TracesBody from './TracesBody.vue'

const search = useTraceSearch()
const detail = useTraceDetail()
const saved = useSavedQueries()
const activeId = ref<string | undefined>(undefined)

const setFilters = (next: SearchFilters): void => {
  search.filters.value = next
}
const onSubmit = (): void => void search.run()
const onReset = (): void => {
  search.reset()
  detail.clear()
  activeId.value = undefined
}
const onSelect = (traceId: string): void => {
  activeId.value = traceId
  void detail.load(traceId)
}

const savedHandlers = buildSavedHandlers(
  saved,
  () => search.filters.value,
  setFilters
)

const hasMore = computed(() => search.nextCursor.value !== undefined)
</script>

<template>
  <main class="traces-view">
    <SavedQueriesBar
      :queries="saved.queries.value"
      @save="savedHandlers.save"
      @load="savedHandlers.load"
      @rename="savedHandlers.rename"
      @remove="savedHandlers.remove"
    />
    <SearchForm
      :filters="search.filters.value"
      :loading="search.loading.value"
      @submit="onSubmit"
      @reset="onReset"
      @update="setFilters"
    />
    <TracesBody
      :traces="search.traces.value"
      :active-id="activeId"
      :search-loading="search.loading.value"
      :has-more="hasMore"
      :detail="detail.detail.value"
      :detail-loading="detail.loading.value"
      :detail-error="detail.error.value"
      @select="onSelect"
      @load-more="search.loadMore()"
    />
  </main>
</template>

<style scoped>
.traces-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
}
</style>
