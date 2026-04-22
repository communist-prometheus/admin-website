<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AssetPanel from '@/components/AssetManager/AssetPanel.vue'
import CoverImage from '@/components/AssetManager/CoverImage.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import { renameContent } from '@/composables/useGitHubApi/rename-content'
import type { Language } from '@/types/content'
import ContentEditMain from './ContentEditView/ContentEditMain.vue'
import ContentPreview from './ContentEditView/ContentPreview.vue'
import EditBreadcrumb from './ContentEditView/EditBreadcrumb.vue'
import { initEditPage } from './ContentEditView/init-edit-page'
import PreviewFooter from './ContentEditView/PreviewFooter.vue'
import { useEditPage } from './ContentEditView/useEditPage'

const props = defineProps<{
  readonly type: string
  readonly slug: string
}>()

const previewing = ref(false)
const p = useEditPage(props.type, props.slug)
const { handleSave, saving, saved, saveError } = initEditPage(p)

const enterPreview = () => { previewing.value = true }
const exitPreview = () => { previewing.value = false }
const onSave = async () => {
  await handleSave()
  if (saveError.value === null) exitPreview()
}
const updateBody = (v: string) => { p.editor.bodyContent.value = v }
const updateFm = (d: Record<string, unknown>) => {
  p.editor.frontmatterData.value = d
}
const handleSwitchLang = (lang: Language) => {
  const available = p.langs.value
  if (available.has(lang)) {
    p.editor.switchLanguage(lang, p.buildPath(lang))
  } else {
    p.editor.switchLanguage(lang)
  }
}
const handleRename = async (newSlug: string) => {
  await renameContent(props.type, props.slug, newSlug)
  globalThis.location.replace(`/content/${props.type}/edit/${newSlug}`)
}
const isRenameable =
  p.contentType.value !== 'pages' &&
  p.contentType.value !== 'common'
</script>

<template>
  <AppLayout>
    <nav class="edit-nav">
      <EditBreadcrumb
        :content-type="p.contentType.value"
        :slug="slug" :renameable="isRenameable"
        @rename="handleRename"
      />
    </nav>
    <LanguageSelector
      v-if="!previewing"
      :model-value="p.editor.currentLang.value"
      :available-languages="p.langs.value"
      @update:model-value="handleSwitchLang"
    />
    <CoverImage
      v-if="!previewing && p.hasCover.value && !p.editor.loadingFile.value"
      :cover-url="p.assets.coverUrl.value"
      @delete-cover="p.ah.onRemoveCover"
      @upload-cover="p.ah.onUploadCover"
    />
    <ContentEditMain
      v-if="!previewing"
      :body-content="p.editor.bodyContent.value"
      :frontmatter-data="p.editor.frontmatterData.value"
      :content-type="p.contentType.value"
      :slug="p.slug"
      :loading-file="p.editor.loadingFile.value"
      :saving="saving"
      :saved="saved"
      :asset-url-map="p.hasAssets.value ? p.assets.urlMap.value : undefined"
      :assets="p.hasAssets.value ? p.assets.allAssets.value : undefined"
      @update:body-content="updateBody"
      @update:frontmatter="updateFm"
      @preview="enterPreview"
      @paste:image="p.ah.onPasteImage"
      @upload-asset="p.ah.onUploadAsset"
      @set-cover="p.ah.onSetCover"
    />
    <ContentPreview
      v-else
      :body-content="p.editor.bodyContent.value"
      :frontmatter-data="p.editor.frontmatterData.value"
      :cover-url="p.assets.coverUrl.value"
      :asset-url-map="p.hasAssets.value ? p.assets.urlMap.value : undefined"
    />
    <PreviewFooter
      v-if="previewing"
      :saving="saving"
      :saved="saved"
      @save="onSave"
      @back="exitPreview"
    />
    <AssetPanel
      v-if="!previewing && p.hasAssets.value && !p.editor.loadingFile.value"
      :assets="p.assets.allAssets.value"
      @set-cover="p.ah.onSetCover"
      @delete-asset="p.ah.onDeleteAsset"
      @upload-asset="p.ah.onUploadAsset"
    />
    <LoadingOverlay :show="p.list.loadingList.value" />
    <ErrorMessage :error="saveError" />
  </AppLayout>
</template>

<style scoped>
.edit-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  font-size: clamp(0.875rem, 2vw, 1rem);
}
</style>
