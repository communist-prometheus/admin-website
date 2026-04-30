<script setup lang="ts">
import { computed } from 'vue'
import { notifyInfo } from '@/composables/useNotifications'
import {
  requestFinalizeResolution,
  requestResolveFile,
} from '@/composables/useNotifications/push-control'
import { useConflictsStore } from '@/stores/conflicts'
import type { ResolveStrategy } from '@/sw/protocol/push-control'
import ConflictsEmpty from './ConflictsEmpty.vue'
import ConflictsFinalize from './ConflictsFinalize.vue'
import ConflictsHeader from './ConflictsHeader.vue'
import ConflictsHint from './ConflictsHint.vue'
import ConflictsList from './ConflictsList.vue'
import { CONFLICT_TEST_IDS } from './test-ids'

const store = useConflictsStore()
const files = computed(() => store.current?.files ?? [])
const target = computed(() => store.current?.target ?? '')
const onResolveAll = (): void => {
  store.clear()
}
const onResolve = (file: string, strategy: ResolveStrategy): void => {
  store.setResolution(file, strategy)
  requestResolveFile(file, strategy)
}
const onFinalize = (): void => {
  const usedForce = [...store.resolutions.values()].includes('force-mine')
  requestFinalizeResolution()
  notifyInfo(
    usedForce
      ? 'Force-pushed merge resolution to remote'
      : 'Merge resolution committed and pushed'
  )
  store.clear()
}
</script>

<template>
  <section class="conflicts-view" :data-testid="CONFLICT_TEST_IDS.root">
    <ConflictsHeader
      :has-conflict="store.hasConflict"
      @resolve-all="onResolveAll"
    />
    <ConflictsEmpty v-if="!store.hasConflict" />
    <ConflictsHint v-else :target="target" />
    <ConflictsList
      :files="files"
      :resolutions="store.resolutions"
      @resolve="onResolve"
    />
    <ConflictsFinalize
      v-if="store.allResolved"
      @finalize="onFinalize"
    />
  </section>
</template>

<style scoped>
.conflicts-view {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 720px;
}
</style>
