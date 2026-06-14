<script setup lang="ts">
import type { DownloadableAsset } from '@/composables/useAssets/download-asset'
import type { AssetDisplay } from '@/composables/useAssets/types'
import AssetThumbnail from './AssetThumbnail.vue'

defineProps<{
  readonly assets: readonly AssetDisplay[]
}>()

const emit = defineEmits<{
  'set-cover': [name: string]
  'delete-asset': [path: string]
  'download-asset': [asset: DownloadableAsset]
}>()

// A committed asset is fetched fresh through the SW; a pending one is
// only in memory, so hand its blob URL straight to the downloader.
const toDownloadable = (asset: AssetDisplay): DownloadableAsset => ({
  path: asset.path,
  name: asset.name,
  blobUrl: asset.status === 'committed' ? undefined : asset.thumbnailUrl,
})

const onDownload = (asset: AssetDisplay): void => {
  emit('download-asset', toDownloadable(asset))
}
</script>

<template>
  <ul class="asset-grid">
    <AssetThumbnail
      v-for="asset in assets"
      :key="asset.path"
      v-bind="asset"
      @set-cover="$emit('set-cover', asset.name)"
      @delete="$emit('delete-asset', asset.path)"
      @download="onDownload(asset)"
    />
  </ul>
</template>

<style scoped>
.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(150px, 100%), 1fr));
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
