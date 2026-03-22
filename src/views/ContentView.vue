<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AuthButton from '@/components/AuthButton.vue'
import DeleteConfirmDialog from '@/components/ContentList/DeleteConfirmDialog.vue'
import CreateContentDialog from '@/components/CreateContentDialog/CreateContentDialog.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { useContentCreator } from '@/composables/useContent/useContentCreator'
import { useContentList } from '@/composables/useContent/useContentList'
import { useAuthStore } from '@/stores/auth'
import type { ContentItem, ContentType, Language } from '@/types/content'
import ContentViewHeader from './ContentView/ContentViewHeader.vue'
import ContentViewMain from './ContentView/ContentViewMain.vue'
import { createDeleteHandlers } from './ContentView/create-delete-handlers'

const FIXED_STRUCTURE_TYPES: ReadonlySet<ContentType> = new Set(['pages', 'common'])

const props = defineProps<{
  readonly contentType: ContentType
}>()

const router = useRouter()
const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)
const isFixedStructure = computed(() => FIXED_STRUCTURE_TYPES.has(props.contentType))

const contentTypeRef = computed(() => props.contentType)
const { items, loadingList, loadContent, reloadContent } =
  useContentList(contentTypeRef)
const { createContent } = useContentCreator(() => props.contentType)
const error = ref<string | null>(null)

const selectedLang = ref<Language>('en')
const showCreateDialog = ref(false)
const openCreateDialog = () => { showCreateDialog.value = true }
const closeCreateDialog = () => { showCreateDialog.value = false }

const handleSelect = (item: ContentItem) => {
  router.push({
    name: 'content-edit',
    params: { type: props.contentType, slug: item.slug },
  })
}

const handleCreate = async (data: Parameters<typeof createContent>[0]) => {
  await createContent(data)
  await loadContent()
  showCreateDialog.value = false
}

const deleteTarget = ref<ContentItem | undefined>()
const showDeleteDialog = computed(() => deleteTarget.value !== undefined)

const handlers = createDeleteHandlers({
  contentType: props.contentType,
  selectedLang: selectedLang.value,
  reload: reloadContent,
  clearTarget: () => { deleteTarget.value = undefined },
})

const handleDeleteAll = () => {
  if (deleteTarget.value) handlers.deleteAll(deleteTarget.value)
}
const handleDeleteLang = () => {
  if (deleteTarget.value) handlers.deleteLang(deleteTarget.value)
}
</script>

<template>
  <AppLayout>
    <template #header-actions>
      <AuthButton />
    </template>

    <ContentViewHeader
      v-model="selectedLang"
      :content-type="contentType"
    />

    <ContentViewMain
      :items="items"
      :selected-lang="selectedLang"
      :is-authenticated="isAuthenticated"
      :loading="loadingList"
      :hide-create="isFixedStructure"
      :hide-delete="isFixedStructure"
      @select="handleSelect"
      @create="openCreateDialog"
      @delete="item => { deleteTarget = item }"
    />

    <LoadingOverlay :show="loadingList" />
    <ErrorMessage :error="error" />

    <CreateContentDialog
      v-if="!isFixedStructure"
      :show="showCreateDialog"
      :content-type="contentType"
      :lang="selectedLang"
      @close="closeCreateDialog"
      @create="handleCreate"
    />

    <DeleteConfirmDialog
      v-if="!isFixedStructure"
      :show="showDeleteDialog"
      :slug="deleteTarget?.slug ?? ''"
      :current-lang="selectedLang"
      @delete-all="handleDeleteAll"
      @delete-lang="handleDeleteLang"
      @close="() => { deleteTarget = undefined }"
    />
  </AppLayout>
</template>
