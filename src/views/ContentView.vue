<script setup lang="ts">
import { toRef } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import DeleteConfirmDialog from '@/components/ContentList/DeleteConfirmDialog.vue'
import CreateContentDialog from '@/components/CreateContentDialog/CreateContentDialog.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import type { ContentType } from '@/types/content'
import ContentViewHeader from './ContentView/ContentViewHeader.vue'
import ContentViewMain from './ContentView/ContentViewMain.vue'
import { createDeleteState } from './ContentView/delete-state'
import { createSelectHandler } from './ContentView/select-handler'
import { useContentView } from './ContentView/use-content-view'

const props = defineProps<{ readonly contentType: ContentType }>()
const typeRef = toRef(() => props.contentType)
const { router, isAuthenticated, isFixedStructure, items,
  loadingList, loadContent, reloadContent, createContent,
  error, selectedLang, showCreateDialog,
} = useContentView(typeRef)
const handleSelect = createSelectHandler(router, typeRef)
const del = createDeleteState(typeRef, selectedLang, reloadContent)
const handleCreate = async (data: Parameters<typeof createContent>[0]) => {
  await createContent(data)
  await loadContent()
  showCreateDialog.value = false
}
</script>

<template>
  <AppLayout>
    <ContentViewHeader v-model="selectedLang" :content-type="contentType" />
    <ContentViewMain
      :items="items" :selected-lang="selectedLang"
      :is-authenticated="isAuthenticated" :loading="loadingList"
      :hide-create="isFixedStructure" :hide-delete="isFixedStructure"
      @select="handleSelect"
      @create="() => { showCreateDialog = true }"
      @delete="item => { del.deleteTarget.value = item }" />
    <LoadingOverlay :show="loadingList" />
    <ErrorMessage :error="error" />
    <CreateContentDialog
      v-if="!isFixedStructure" :show="showCreateDialog"
      :content-type="contentType" :lang="selectedLang"
      @close="() => { showCreateDialog = false }" @create="handleCreate" />
    <DeleteConfirmDialog
      v-if="!isFixedStructure" :show="del.showDeleteDialog.value"
      :slug="del.deleteTarget.value?.slug ?? ''" :current-lang="selectedLang"
      @delete-all="del.handleDeleteAll" @delete-lang="del.handleDeleteLang"
      @close="() => { del.deleteTarget.value = undefined }" />
  </AppLayout>
</template>
