<script setup lang="ts">
import { onMounted, toRef } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import DeleteConfirmDialog from '@/components/ContentList/DeleteConfirmDialog.vue'
import CreateContentDialog from '@/components/CreateContentDialog/CreateContentDialog.vue'
import type { CreateContentData } from '@/components/CreateContentDialog/helpers'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { setNewContentDraft } from '@/composables/useContent/new-content-draft'
import { usePushAndTrack } from '@/composables/useDeployStatus/push-and-track'
import { useLabelsStore } from '@/stores/labels'
import type { ContentType } from '@/types/content'
import ContentViewHeader from './ContentView/ContentViewHeader.vue'
import ContentViewMain from './ContentView/ContentViewMain.vue'
import { createDeleteState } from './ContentView/delete-state'
import { createSelectHandler } from './ContentView/select-handler'
import { useBulkDelete } from './ContentView/use-bulk-delete'
import { useContentView } from './ContentView/use-content-view'

const props = defineProps<{ readonly contentType: ContentType }>()
const typeRef = toRef(() => props.contentType)
const {
  router, isAuthenticated, isFixedStructure, items,
  loadingList, reloadContent,
  error, selectedLang, showCreateDialog,
} = useContentView(typeRef)
const labelsStore = useLabelsStore()
onMounted(() => labelsStore.ensureLoaded())
const handleSelect = createSelectHandler(router, typeRef)
const pushAndTrack = usePushAndTrack()
const del = createDeleteState({
  contentType: typeRef,
  selectedLang,
  listItems: items,
  reload: reloadContent,
  pushAndTrack,
})
const bulk = useBulkDelete({
  contentType: typeRef,
  reload: reloadContent,
  pushAndTrack,
})

const handleCreate = (data: CreateContentData) => {
  setNewContentDraft(data)
  showCreateDialog.value = false
  router.push({
    name: 'content-edit',
    params: { type: props.contentType, slug: data.slug },
  })
}
</script>

<template>
  <AppLayout>
    <ContentViewHeader v-model="selectedLang" :content-type="contentType" />
    <ContentViewMain
      :items="items" :selected-lang="selectedLang"
      :is-authenticated="isAuthenticated" :loading="loadingList"
      :hide-create="isFixedStructure" :hide-delete="isFixedStructure"
      :deleting-slugs="del.deletingSlugs.value"
      :select-mode="bulk.selectMode.value"
      :selected-slugs="bulk.selectedSlugs.value"
      @select="handleSelect"
      @create="() => { showCreateDialog = true }"
      @delete="item => { del.deleteTarget.value = item }"
      @enter-select="bulk.enter"
      @exit-select="bulk.exit"
      @toggle-select="bulk.toggle"
      @bulk-delete="bulk.runDelete"
    />
    <LoadingOverlay :show="loadingList" />
    <ErrorMessage :error="error" />
    <CreateContentDialog
      v-if="!isFixedStructure" :show="showCreateDialog"
      :content-type="contentType" :lang="selectedLang"
      :labels="labelsStore.labels"
      @close="() => { showCreateDialog = false }"
      @create="handleCreate"
    />
    <DeleteConfirmDialog
      v-if="!isFixedStructure" :show="del.showDeleteDialog.value"
      :slug="del.deleteTarget.value?.slug ?? ''" :current-lang="selectedLang"
      @delete-all="del.handleDeleteAll" @delete-lang="del.handleDeleteLang"
      @close="() => { del.deleteTarget.value = undefined }"
    />
  </AppLayout>
</template>
