<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AuthButton from '@/components/AuthButton.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import { useContentList } from '@/composables/useContent/useContentList'
import { useMultiLangEditor } from '@/composables/useContent/useMultiLangEditor'
import { useUnsavedGuard } from '@/composables/useUnsavedGuard'
import { useAuthStore } from '@/stores/auth'
import type { ContentType, Language } from '@/types/content'
import { getAvailableLanguages } from '@/utils/available-languages'
import ContentEditHeader from './ContentEditView/ContentEditHeader.vue'
import ContentEditMain from './ContentEditView/ContentEditMain.vue'
import { createInitEditor } from './ContentEditView/useEditPageInit'

const props = defineProps<{
  readonly type: string
  readonly slug: string
}>()

const isAuthenticated = computed(() => !!useAuthStore().user)
const contentType = computed(() => props.type as ContentType)
const { items, loadingList, loadContent } = useContentList(contentType)
const editor = useMultiLangEditor()

const availableLanguages = computed(() =>
  getAvailableLanguages(items.value, props.slug),
)
const buildPath = (lang: Language) =>
  `src/content/${props.type}/${props.slug}.${lang}.md`

const handleSave = async (message: string) => {
  await editor.saveCurrentLanguage(buildPath(editor.currentLang.value), message)
  await loadContent()
}
const updateBody = (v: string) => { editor.bodyContent.value = v }
const updateFm = (d: Record<string, unknown>) => { editor.frontmatterData.value = d }

const initEditor = createInitEditor({
  ...editor, loadContent, availableLanguages, buildPath,
})

useUnsavedGuard(editor.isDirty)
onMounted(() => { if (isAuthenticated.value) initEditor() })
watch(isAuthenticated, (auth) => { if (auth) initEditor() })
</script>

<template>
  <AppLayout>
    <template #header-actions><AuthButton /></template>
    <ContentEditHeader
      :slug="slug" :content-type="contentType"
      :current-lang="editor.currentLang.value"
      :available-languages="availableLanguages"
    />
    <ContentEditMain
      :body-content="editor.bodyContent.value"
      :frontmatter-data="editor.frontmatterData.value"
      :content-type="contentType" :loading-file="editor.loadingFile.value"
      @update:body-content="updateBody" @update:frontmatter="updateFm" @save="handleSave"
    />
    <LoadingOverlay :show="loadingList" />
    <ErrorMessage :error="null" />
  </AppLayout>
</template>
