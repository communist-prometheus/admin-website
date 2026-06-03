<script setup lang="ts">
import type { Lang, Subscriber } from '@/stores/comms'
import SubscriberRow from './SubscriberRow.vue'

defineProps<{ readonly subscribers: readonly Subscriber[] }>()

const emit = defineEmits<{
  langs: [id: number, langs: readonly Lang[]]
  remove: [id: number]
}>()
</script>

<template>
  <ul class="subscribers" data-testid="subscribers-table">
    <SubscriberRow
      v-for="s in subscribers"
      :key="s.id"
      :entry="s"
      @langs="(id, langs) => emit('langs', id, langs)"
      @remove="id => emit('remove', id)"
    />
  </ul>
</template>

<style scoped>
.subscribers {
  margin: 0;
  padding: 0;
}
</style>
