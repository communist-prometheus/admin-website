<script setup lang="ts">
import { computed, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AssetPanel from '@/components/AssetManager/AssetPanel.vue'
import CoverImage from '@/components/AssetManager/CoverImage.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import FileViewer from '@/components/FileViewer/FileViewer.vue'
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import { useFileViewer } from '@/composables/useFileViewer/useFileViewer'
import ContentEditMain from './ContentEditView/ContentEditMain.vue'
import ContentPreview from './ContentEditView/ContentPreview.vue'
import EditBreadcrumb from './ContentEditView/EditBreadcrumb.vue'
import { initEditPage } from './ContentEditView/init-edit-page'
import PreviewFooter from './ContentEditView/PreviewFooter.vue'
import PublishConfirmDialog from './ContentEditView/PublishConfirmDialog.vue'
import { setupEditHandlers } from './ContentEditView/setup-handlers'
import { useSaveFlow } from './ContentEditView/use-save-flow'
import { useEditPage } from './ContentEditView/useEditPage'

const props = defineProps<{ readonly type: string; readonly slug: string }>()
const previewing = ref(false)
const p = useEditPage(props.type, props.slug)
const { handleSave, saving, saved, saveError } = initEditPage(p)
const h = setupEditHandlers(p, {
  type: props.type,
  slug: props.slug,
  previewing,
  saveError,
})
const flow = useSaveFlow({
  contentType: () => p.contentType.value,
  frontmatter: () => p.editor.frontmatterData.value,
  handleSave,
  saveError,
  exitPreview: h.exitPreview,
})
const title = computed(() =>
  String(p.editor.frontmatterData.value.title ?? p.slug)
)
const isRenameable = computed(
  () => p.contentType.value !== 'pages' && p.contentType.value !== 'common'
)
const {
  open: viewerOpen,
  index: viewerIndex,
  files: viewerFiles,
  openAt: openViewer,
  close: closeViewer,
  setIndex: setViewerIndex,
  downloadAt: downloadViewerFile,
} = useFileViewer(
  () => (p.hasAssets.value ? p.assets.allAssets.value : []),
  asset => {
    void p.ah.onDownloadAsset(asset)
  }
)
</script>

<template>
  <AppLayout>
    <nav class="edit-nav">
      <EditBreadcrumb
        :content-type="p.contentType.value"
        :slug="slug" :renameable="isRenameable"
        @rename="h.handleRename"
      />
    </nav>
    <LanguageSelector
      v-if="!previewing"
      :model-value="p.editor.currentLang.value"
      :available-languages="p.langs.value"
      @update:model-value="h.handleSwitchLang"
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
      :asset-url-map="p.hasAssets.value ? p.assets.urlMap.value : undefined"
      :assets="p.hasAssets.value ? p.assets.allAssets.value : undefined"
      :lang="p.editor.currentLang.value"
      @update:body-content="h.updateBody"
      @update:frontmatter="h.updateFm"
      @preview="h.enterPreview"
      @paste:image="p.ah.onPasteImage"
      @upload-asset="p.ah.onUploadAsset"
      @set-cover="p.ah.onSetCover"
      @error="h.setError"
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
      @save="flow.onSave"
      @back="h.exitPreview"
    />
    <AssetPanel
      v-if="!previewing && p.hasAssets.value && !p.editor.loadingFile.value"
      :assets="p.assets.allAssets.value"
      @set-cover="p.ah.onSetCover"
      @delete-asset="p.ah.onDeleteAsset"
      @upload-asset="p.ah.onUploadAsset"
      @download-asset="p.ah.onDownloadAsset"
      @view-asset="openViewer"
    />
    <FileViewer
      v-if="viewerOpen"
      :files="viewerFiles"
      :index="viewerIndex"
      @close="closeViewer"
      @update:index="setViewerIndex"
      @download="downloadViewerFile"
    />
    <PublishConfirmDialog
      :show="flow.showDialog.value"
      :title="title"
      :auto-public="flow.autoPublic.value"
      @confirm="flow.onConfirm"
      @cancel="flow.onCancel"
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
