<script setup lang="ts">
import { computed, ref } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import AssetPanel from '@/components/AssetManager/AssetPanel.vue'
import CoverImage from '@/components/AssetManager/CoverImage.vue'
import ErrorMessage from '@/components/common/ErrorMessage.vue'
import LoadingOverlay from '@/components/common/LoadingOverlay.vue'
import LanguageSelector from '@/components/LanguageSelector/LanguageSelector.vue'
import ContentEditMain from './ContentEditView/ContentEditMain.vue'
import ContentPreview from './ContentEditView/ContentPreview.vue'
import EditBreadcrumb from './ContentEditView/EditBreadcrumb.vue'
import { initEditPage } from './ContentEditView/init-edit-page'
import PreviewFooter from './ContentEditView/PreviewFooter.vue'
import PublishConfirmDialog from './ContentEditView/PublishConfirmDialog.vue'
import { useSaveFlow } from './ContentEditView/use-save-flow'
import { useEditPage } from './ContentEditView/useEditPage'
import {
  makeRename,
  makeSwitchLang,
  makeUpdaters,
} from './ContentEditView/wire-handlers'

const props = defineProps<{ readonly type: string; readonly slug: string }>()
const previewing = ref(false)
const p = useEditPage(props.type, props.slug)
const { handleSave, saving, saved, saveError } = initEditPage(p)
const enterPreview = () => { previewing.value = true }
const exitPreview = () => { previewing.value = false }
const flow = useSaveFlow({
  contentType: () => p.contentType.value,
  frontmatter: () => p.editor.frontmatterData.value,
  handleSave,
  saveError,
  exitPreview,
})

const { updateBody, updateFm } = makeUpdaters(
  p.editor.bodyContent,
  p.editor.frontmatterData
)
const handleSwitchLang = makeSwitchLang({
  langs: p.langs,
  switchLanguage: p.editor.switchLanguage,
  buildPath: p.buildPath,
})
const handleRename = makeRename(props.type, props.slug)
const title = computed(() => String(p.editor.frontmatterData.value.title ?? p.slug))
const isRenameable = computed(
  () => p.contentType.value !== 'pages' && p.contentType.value !== 'common'
)
const setError = (msg: string): void => {
  saveError.value = msg
}
</script>

<template>
  <AppLayout>
    <section class="edit-frame">
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
        :asset-url-map="p.hasAssets.value ? p.assets.urlMap.value : undefined"
        :assets="p.hasAssets.value ? p.assets.allAssets.value : undefined"
        @update:body-content="updateBody"
        @update:frontmatter="updateFm"
        @preview="enterPreview"
        @paste:image="p.ah.onPasteImage"
        @upload-asset="p.ah.onUploadAsset"
        @set-cover="p.ah.onSetCover"
        @error="setError"
      />
      <ContentPreview
        v-else
        :body-content="p.editor.bodyContent.value"
        :frontmatter-data="p.editor.frontmatterData.value"
        :cover-url="p.assets.coverUrl.value"
        :asset-url-map="p.hasAssets.value ? p.assets.urlMap.value : undefined"
      />
      <AssetPanel
        v-if="!previewing && p.hasAssets.value && !p.editor.loadingFile.value"
        :assets="p.assets.allAssets.value"
        @set-cover="p.ah.onSetCover"
        @delete-asset="p.ah.onDeleteAsset"
        @upload-asset="p.ah.onUploadAsset"
      />
    </section>
    <PreviewFooter
      v-if="previewing"
      :saving="saving"
      :saved="saved"
      @save="flow.onSave"
      @back="exitPreview"
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
/*
 * One frame for every edit-mode child: same max-width, same
 * horizontal gutter, same vertical rhythm. Previously the breadcrumb
 * sat flush at the viewport edge while the body had a 16-32px
 * padding inset and the language fieldset had its own 8-16px inset —
 * the result on mobile was a ragged left edge that the editor read
 * as "more padding on the left than the right".
 */
.edit-frame {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 2vw, 1.25rem);
  padding: var(--content-frame-padding);
  max-width: var(--content-narrow);
  width: 100%;
  margin-inline: auto;
  box-sizing: border-box;
}

.edit-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: clamp(0.875rem, 2vw, 1rem);
}
</style>
