<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AuthButton from '@/components/AuthButton.vue'
import ContentList from '@/components/ContentList/ContentList.vue'
import ContentNav from '@/components/ContentNav/ContentNav.vue'
import CreateContentDialog from '@/components/CreateContentDialog/CreateContentDialog.vue'
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import MarkdownEditor from '@/components/MarkdownEditor/MarkdownEditor.vue'
import { useContent } from '@/composables/useContent'
import { useAuthStore } from '@/stores/auth'
import type { Language } from '@/types/content'

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

const handleSelect = (item: Parameters<typeof selectItem>[0]) => {
  selectItem(item)
}

const handleSave = (message: string) => {
  saveContent(message)
}

const handleCreate = async (data: Parameters<typeof createContent>[0]) => {
  await createContent(data)
  showCreateDialog.value = false
}

const openCreateDialog = () => {
  showCreateDialog.value = true
}

const closeCreateDialog = () => {
  showCreateDialog.value = false
}

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

    <div class="content-view">
    <ContentNav />
    
    <div class="view-header">
      <h1>{{ contentType.charAt(0).toUpperCase() + contentType.slice(1) }}</h1>
      <LanguageSelector v-model="selectedLang" />
    </div>

    <div class="view-content">
      <ContentList
        :items="items"
        :selected-lang="selectedLang"
        :selected-path="selectedItem?.path ?? null"
        @select="handleSelect"
        @create="isAuthenticated ? openCreateDialog : undefined"
      />
      
      <MarkdownEditor
        v-if="isAuthenticated"
        v-model="fileContent"
        :file-path="selectedItem?.path ?? null"
        @save="handleSave"
      />
      <div v-else class="auth-required">
        <p>Please log in to edit content</p>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading-overlay"
    >
      <p>Loading...</p>
    </div>
    
    <div
      v-if="error"
      class="error-message"
    >
      <p>Error: {{ error }}</p>
    </div>

    <CreateContentDialog
      :show="showCreateDialog"
      :content-type="contentType"
      @close="closeCreateDialog"
      @create="handleCreate"
    />
  </div>
  </AppLayout>
</template>

<style scoped>
.content-view {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(1rem, 2vw, 1.5rem) clamp(1rem, 3vw, 2rem);
  border-bottom: 1px solid var(--color-border);
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
  text-transform: capitalize;
}

.view-content {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: clamp(1rem, 3vw, 2rem);
  padding: clamp(1rem, 3vw, 2rem);
  flex: 1;
  overflow: hidden;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
  z-index: 1000;
}

.loading-overlay p {
  padding: clamp(1rem, 2vw, 2rem);
  background: var(--color-background);
  border-radius: var(--radius-lg);
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--color-text);
}

.error-message {
  position: fixed;
  top: clamp(1rem, 2vw, 2rem);
  right: clamp(1rem, 2vw, 2rem);
  padding: clamp(0.75rem, 2vw, 1rem);
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  z-index: 1000;
}

.error-message p {
  margin: 0;
  color: #ef4444;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.auth-required {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--color-text-secondary);
  font-size: clamp(1rem, 2vw, 1.25rem);
}
</style>
