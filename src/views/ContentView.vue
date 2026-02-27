<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AuthButton from '@/components/AuthButton.vue'
import ContentNav from '@/components/ContentNav/ContentNav.vue'
import CreateContentDialog from '@/components/CreateContentDialog/CreateContentDialog.vue'
import { useContent } from '@/composables/useContent'
import { useAuthStore } from '@/stores/auth'
import type { Language } from '@/types/content'
import ContentViewHeader from './ContentView/ContentViewHeader.vue'
import ContentViewMain from './ContentView/ContentViewMain.vue'
import ContentViewOverlays from './ContentView/ContentViewOverlays.vue'

const props = defineProps<{
  readonly contentType: 'blog' | 'pages' | 'positions'
}>()

const authStore = useAuthStore()
const isAuthenticated = computed(() => !!authStore.user)

const {
  items,
  selectedItem,
  fileContent,
  loading,
  error,
  loadContent,
  selectItem,
  saveContent,
  createContent,
} = useContent(props.contentType)

const selectedLang = ref<Language>('en')
const showCreateDialog = ref(false)

watch(() => props.contentType, async () => {
  selectedItem.value = null
  fileContent.value = ''
  await loadContent()
}, { immediate: true })

onMounted(async () => {
  await loadContent()
})
</script>

<template>
  <AppLayout>
    <template #header-actions>
      <AuthButton />
    </template>

    <ContentNav />
    
    <ContentViewHeader
      v-model="selectedLang"
      :content-type="contentType"
    />

    <ContentViewMain
      :items="items"
      :selected-lang="selectedLang"
      :selected-path="selectedItem?.path ?? null"
      :file-content="fileContent"
      :is-authenticated="isAuthenticated"
      @select="selectItem"
      @create="showCreateDialog = true"
      @save="saveContent"
      @update:file-content="fileContent = $event"
    />

    <ContentViewOverlays
      :loading="loading"
      :error="error"
    />

    <CreateContentDialog
      :show="showCreateDialog"
      :content-type="contentType"
      @close="showCreateDialog = false"
      @create="(data) => { createContent(data); showCreateDialog = false }"
    />
  </AppLayout>
</template>
