<script setup lang="ts">
import type { AssetDisplay } from '@/composables/useAssets/types'
import AssetThumbnail from './AssetThumbnail.vue'

defineProps<{
  readonly assets: readonly AssetDisplay[]
}>()

defineEmits<{
  'set-cover': [name: string]
  'delete-asset': [path: string]
}>()
</script>

<template>
  <ul class="asset-grid">
    <AssetThumbnail
      v-for="asset in assets"
      :key="asset.path"
      v-bind="asset"
      @set-cover="$emit('set-cover', asset.name)"
      @delete="$emit('delete-asset', asset.path)"
    />
  </ul>
</template>

<style scoped>
.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
