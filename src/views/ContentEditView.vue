<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import AssetPanel from '@/components/AssetManager/AssetPanel.vue'
import CoverImage from '@/components/AssetManager/CoverImage.vue'
import AuthButton from '@/components/AuthButton.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import ContentEditHeader from './ContentEditView/ContentEditHeader.vue'
import ContentEditMain from './ContentEditView/ContentEditMain.vue'
import { initEditPage } from './ContentEditView/init-edit-page'
import { useEditPage } from './ContentEditView/useEditPage'

const props = defineProps<{
  readonly type: string
  readonly slug: string
}>()

const p = useEditPage(props.type, props.slug)
const { handleSave } = initEditPage(p)
const updateBody = (v: string) => { p.editor.bodyContent.value = v }
const updateFm = (d: Record<string, unknown>) => {
  p.editor.frontmatterData.value = d
}
</script>

<template>
  <AppLayout>
    <template #header-actions><AuthButton /></template>
    <ContentEditHeader
      :slug="slug" :content-type="p.contentType.value"
      :current-lang="p.editor.currentLang.value"
      :available-languages="p.langs.value"
    />
    <CoverImage
      v-if="p.isBlog.value && !p.editor.loadingFile.value"
      :cover-url="p.assets.coverUrl.value"
      @delete-cover="p.ah.onRemoveCover"
      @upload-cover="p.ah.onUploadCover"
    />
    <ContentEditMain
      :body-content="p.editor.bodyContent.value"
      :frontmatter-data="p.editor.frontmatterData.value"
      :content-type="p.contentType.value"
      :loading-file="p.editor.loadingFile.value"
      :asset-url-map="p.isBlog.value ? p.assets.urlMap.value : undefined"
      @update:body-content="updateBody"
      @update:frontmatter="updateFm"
      @save="handleSave"
      @paste:image="p.ah.onPasteImage"
    />
    <AssetPanel
      v-if="p.isBlog.value && !p.editor.loadingFile.value"
      :assets="p.assets.allAssets.value"
      @set-cover="p.ah.onSetCover"
      @delete-asset="p.ah.onDeleteAsset"
      @upload-asset="p.ah.onUploadAsset"
    />
    <LoadingOverlay :show="p.list.loadingList.value" />
    <ErrorMessage :error="null" />
  </AppLayout>
</template>
