<script setup lang="ts">
import type { AssetDisplay } from '@/composables/useAssets/types'
import AssetGrid from './AssetGrid.vue'
import AssetPanelHeader from './AssetPanelHeader.vue'
import { ASSET_PANEL_ID } from './test-ids'

defineProps<{
  readonly assets: readonly AssetDisplay[]
}>()

defineEmits<{
  'set-cover': [name: string]
  'delete-asset': [path: string]
  'upload-asset': [file: File]
}>()
</script>

<template>
  <section :data-testid="ASSET_PANEL_ID" class="asset-panel">
    <AssetPanelHeader @upload="$emit('upload-asset', $event)" />
    <AssetGrid
      v-if="assets.length"
      :assets="assets"
      @set-cover="$emit('set-cover', $event)"
      @delete-asset="$emit('delete-asset', $event)"
    />
    <p v-else class="empty">No assets yet</p>
  </section>
</template>

<style scoped>
.asset-panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: clamp(0.75rem, 2vw, 1rem);
}

.empty {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin: 0;
}
</style>
