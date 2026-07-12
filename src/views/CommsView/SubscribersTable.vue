<script setup lang="ts">
import type { Lang, Subscriber } from '@/stores/comms'
import SubscriberRow from './SubscriberRow.vue'

defineProps<{ readonly subscribers: readonly Subscriber[] }>()
const emit = defineEmits<{
  langs: [id: number, langs: readonly Lang[]]
  messageLang: [id: number, messageLang: Lang]
  lastSent: [id: number, lastSentAt: string | null]
  remove: [id: number]
}>()
</script>

<template>
  <table
    v-if="subscribers.length > 0"
    class="subs-table"
    data-testid="subscribers-table"
  >
    <thead>
      <tr>
        <th scope="col" class="th-email">Email</th>
        <th scope="col" class="th-langs">Languages</th>
        <th scope="col" class="th-msg-lang">Message</th>
        <th scope="col" class="th-status">Status</th>
        <th scope="col" class="th-sent">Last sent</th>
        <th scope="col" class="th-actions"><span class="sr-only">Actions</span></th>
      </tr>
    </thead>
    <tbody>
      <SubscriberRow
        v-for="entry in subscribers"
        :key="entry.id"
        :entry="entry"
        @langs="(id, l) => emit('langs', id, l)"
        @message-lang="(id, ml) => emit('messageLang', id, ml)"
        @last-sent="(id, at) => emit('lastSent', id, at)"
        @remove="id => emit('remove', id)"
      />
    </tbody>
  </table>
</template>

<style scoped>
.subs-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

@media (width < 640px) {
  .subs-table,
  .subs-table thead,
  .subs-table tbody {
    display: block;
  }

  /* Hide the column header row on mobile — each card row carries
     its own labels via SubscriberRow's own mobile mode. */
  .subs-table thead {
    display: none;
  }
}

.subs-table th {
  padding: var(--spacing-xs);
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid var(--color-border);
}

.th-email {
  width: 26%;
}

.th-langs {
  width: 22%;
}

.th-msg-lang {
  width: 14%;
}

.th-status {
  width: 13%;
}

.th-sent {
  width: 18%;
}

.th-actions {
  width: 7%;
  text-align: right;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
</style>
