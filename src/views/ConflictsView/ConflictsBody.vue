<script setup lang="ts">
import { computed } from 'vue'
import { useConflictsStore } from '@/stores/conflicts'
import ConflictsEmpty from './ConflictsEmpty.vue'
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
</script>

<template>
  <section class="conflicts-view" :data-testid="CONFLICT_TEST_IDS.root">
    <ConflictsHeader
      :has-conflict="store.hasConflict"
      @resolve-all="onResolveAll"
    />
    <ConflictsEmpty v-if="!store.hasConflict" />
    <ConflictsHint v-else :target="target" />
    <ConflictsList :files="files" />
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
