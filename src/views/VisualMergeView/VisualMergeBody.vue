<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { requestResolveFileContent } from '@/composables/useNotifications/push-control'
import { useConflictsStore } from '@/stores/conflicts'
import { fetchFileContent } from './fetch-file-content'
import MergeEditor from './MergeEditor.vue'
import { parseThreeWays, type ThreeWaySplit } from './parse-three-ways'
import { VISUAL_MERGE_TEST_IDS } from './test-ids'
import VisualMergeHeader from './VisualMergeHeader.vue'

const route = useRoute()
const router = useRouter()
const store = useConflictsStore()
const file = String(route.params['file'] ?? '')
const split = ref<ThreeWaySplit | undefined>(undefined)
const merged = ref('')

onMounted(async () => {
  const content = (await fetchFileContent(file)) ?? ''
  const next = parseThreeWays(content)
  split.value = next
  merged.value = next.merged
})

const onUpdate = (next: string): void => {
  merged.value = next
}
const onSave = (): void => {
  requestResolveFileContent(file, merged.value)
  store.setResolution(file, 'mine')
  void router.push('/conflicts')
}
const onCancel = (): void => {
  void router.push('/conflicts')
}
</script>

<template>
  <section class="visual-merge" :data-testid="VISUAL_MERGE_TEST_IDS.root">
    <VisualMergeHeader
      :file="file"
      @save="onSave"
      @cancel="onCancel"
    />
    <p
      v-if="split === undefined"
      class="loading"
      :data-testid="VISUAL_MERGE_TEST_IDS.loading"
    >
      Loading file…
    </p>
    <MergeEditor
      v-else
      :ours="split.ours"
      :theirs="split.theirs"
      :merged="merged"
      @update="onUpdate"
    />
  </section>
</template>

<style scoped>
.visual-merge {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.loading {
  color: var(--color-text-muted, #888);
}
</style>
