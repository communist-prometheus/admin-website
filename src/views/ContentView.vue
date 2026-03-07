<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '@/components/AppLayout.vue'
import AuthButton from '@/components/AuthButton.vue'
import CreateContentDialog from '@/components/CreateContentDialog/CreateContentDialog.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { useContentCreator } from '@/composables/useContent/useContentCreator'
import { useContentList } from '@/composables/useContent/useContentList'
import { useAuthStore } from '@/stores/auth'
import type { ContentItem, Language } from '@/types/content'
import ContentViewHeader from './ContentView/ContentViewHeader.vue'
import ContentViewMain from './ContentView/ContentViewMain.vue'

const props = defineProps<{
  readonly contentType: 'blog' | 'pages' | 'positions'
}>()

const router = useRouter()
const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)

const contentTypeRef = computed(() => props.contentType)
const { items, loadingList, loadContent } = useContentList(contentTypeRef)
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
      @select="handleSelect"
      @create="openCreateDialog"
    />

    <LoadingOverlay :show="loadingList" />
    <ErrorMessage :error="error" />

    <CreateContentDialog
      :show="showCreateDialog"
      :content-type="contentType"
      :lang="selectedLang"
      @close="closeCreateDialog"
      @create="handleCreate"
    />
  </AppLayout>
</template>
