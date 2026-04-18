<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import DeleteConfirmDialog from '@/components/ContentList/DeleteConfirmDialog.vue'
import CreateContentDialog from '@/components/CreateContentDialog/CreateContentDialog.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { usePushAndTrack } from '@/composables/useDeployStatus/push-and-track'
import { useLabelsStore } from '@/stores/labels'
import type { ContentType } from '@/types/content'
import ContentViewHeader from './ContentView/ContentViewHeader.vue'
import ContentViewMain from './ContentView/ContentViewMain.vue'
import { createDeleteState } from './ContentView/delete-state'
import { createSelectHandler } from './ContentView/select-handler'
import { useContentView } from './ContentView/use-content-view'

const props = defineProps<{ readonly contentType: ContentType }>()
const typeRef = toRef(() => props.contentType)
const { router, isAuthenticated, isFixedStructure, items,
  loadingList, reloadContent, createContent,
  error, selectedLang, showCreateDialog,
} = useContentView(typeRef)
const labelsStore = useLabelsStore()
onMounted(() => labelsStore.ensureLoaded())
const handleSelect = createSelectHandler(router, typeRef)
const pushAndTrack = usePushAndTrack()
const del = createDeleteState(typeRef, selectedLang, reloadContent, pushAndTrack)
const creating = ref(false)
const handleCreate = async (data: Parameters<typeof createContent>[0]) => {
  if (creating.value) return
  creating.value = true
  try {
    error.value = null
    await createContent(data)
    await pushAndTrack(`Create ${data.slug} in ${props.contentType}`)
    await reloadContent()
    showCreateDialog.value = false
    router.push({
      name: 'content-edit',
      params: { type: props.contentType, slug: data.slug },
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create content'
  } finally {
    creating.value = false
  }
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
      :labels="labelsStore.labels" :submitting="creating"
      @close="() => { if (!creating) showCreateDialog = false }"
      @create="handleCreate" />
    <DeleteConfirmDialog
      v-if="!isFixedStructure" :show="del.showDeleteDialog.value"
      :slug="del.deleteTarget.value?.slug ?? ''" :current-lang="selectedLang"
      @delete-all="del.handleDeleteAll" @delete-lang="del.handleDeleteLang"
      @close="() => { del.deleteTarget.value = undefined }" />
  </AppLayout>
</template>
