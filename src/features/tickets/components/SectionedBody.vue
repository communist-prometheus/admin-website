<script setup lang="ts">
import { computed } from 'vue'
import { parseBody } from '../templates/parse-body'
import SectionBlock from './SectionBlock.vue'

const props = defineProps<{ readonly body: string }>()

const sections = computed(() => parseBody(props.body))
const hasStructured = computed(() => sections.value.length > 0)
</script>

<template>
  <article v-if="hasStructured" class="sectioned-body">
    <SectionBlock
      v-for="(s, i) in sections"
      :key="`${s.label}-${i}`"
      :label="s.label"
      :text="s.text"
    />
  </article>
  <p v-else class="legacy-body">{{ body }}</p>
</template>

<style scoped>
.sectioned-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.legacy-body {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
