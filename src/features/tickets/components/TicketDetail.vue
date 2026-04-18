<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import { addComment } from '../api/add-comment'
import type { Ticket, TicketComment } from '../api/gh-tickets'
import { getComments } from '../api/ticket-actions'
import { setTicketState } from '../api/ticket-state'

const props = defineProps<{ readonly ticket: Ticket }>()
const emit = defineEmits<{ back: []; reload: [] }>()

const auth = useAuthStore()
const roleStore = useRoleStore()
const comments = ref<readonly TicketComment[]>([])
const newComment = ref('')
const isAdmin = roleStore.role === 'admin'

const loadComments = async () => {
  if (!auth.user) return
  comments.value = await getComments(auth.user.accessToken, props.ticket.number)
}

const handleComment = async () => {
  if (!auth.user || !newComment.value.trim()) return
  await addComment(auth.user.accessToken, props.ticket.number, newComment.value)
  newComment.value = ''
  await loadComments()
}

const toggleState = async () => {
  if (!auth.user) return
  const next = props.ticket.state === 'open' ? 'closed' : 'open'
  await setTicketState(auth.user.accessToken, props.ticket.number, next)
  emit('reload')
  emit('back')
}

onMounted(loadComments)
</script>

<template>
  <button type="button" class="back-btn" @click="emit('back')">
    &larr; Back to list
  </button>
  <h3>#{{ ticket.number }} {{ ticket.title }}</h3>
  <p class="body">{{ ticket.body }}</p>
  <button
    v-if="isAdmin"
    type="button"
    class="state-btn"
    @click="toggleState"
  >
    {{ ticket.state === 'open' ? 'Close' : 'Reopen' }}
  </button>
  <h4>Comments ({{ comments.length }})</h4>
  <p
    v-for="c in comments"
    :key="c.id"
    class="comment"
  >
    <strong>{{ c.user.login }}</strong>: {{ c.body }}
  </p>
  <textarea
    v-model="newComment"
    placeholder="Add a comment..."
    rows="3"
    class="comment-input"
  />
  <button type="button" class="comment-btn" @click="handleComment">
    Comment
  </button>
</template>

<style scoped>
.back-btn {
  align-self: flex-start;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  font-size: 0.875rem;
}

h3 {
  font-size: 1.25rem;
  margin: 0;
}

.body {
  white-space: pre-wrap;
  line-height: 1.6;
}

.state-btn {
  align-self: flex-start;
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-soft);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.8125rem;
}

h4 {
  font-size: 1rem;
  margin: 0.5rem 0 0;
}

.comment {
  padding: 0.5rem;
  background: var(--color-background-soft);
  border-radius: var(--radius-sm);
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.comment-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  box-sizing: border-box;
}

.comment-btn {
  align-self: flex-start;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>
