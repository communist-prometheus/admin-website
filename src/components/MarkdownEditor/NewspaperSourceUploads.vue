<script setup lang="ts">
import type { AssetDisplay } from '@/composables/useAssets/types'
import DocxUpload from './DocxUpload.vue'
import Fb2Upload from './Fb2Upload.vue'
import PdfUpload from './PdfUpload.vue'
import SourceUploadsHeader from './SourceUploadsHeader.vue'

defineProps<{
  readonly assets?: readonly AssetDisplay[]
  readonly currentCover?: string
  readonly issueTitle?: string
  readonly issueLang?: string
}>()

defineEmits<{
  'upload-asset': [file: File]
  'set-cover': [name: string]
  error: [message: string]
}>()

const HINT =
  'PDF (the printed issue) and FB2 (the readable text) — pick whichever ' +
  'you have. DOCX is auto-converted to FB2 on import.'
</script>

<template>
  <section class="source-uploads" data-testid="newspaper-source-uploads">
    <SourceUploadsHeader title="Source files" :hint="HINT" />
    <PdfUpload
      :assets="assets"
      :current-cover="currentCover"
      @upload-pdf="$emit('upload-asset', $event)"
      @upload-cover="$emit('upload-asset', $event)"
      @set-cover="$emit('set-cover', $event)"
    />
    <DocxUpload
      :assets="assets"
      :issue-title="issueTitle"
      :issue-lang="issueLang"
      @upload-fb2="$emit('upload-asset', $event)"
      @error="$emit('error', $event)"
    />
    <Fb2Upload
      :assets="assets"
      @upload-fb2="$emit('upload-asset', $event)"
      @error="$emit('error', $event)"
    />
  </section>
</template>

<style scoped>
.source-uploads {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.source-uploads > :first-child {
  grid-column: 1 / -1;
  margin-bottom: 0.25rem;
}

@media (width >= 720px) {
  .source-uploads {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
