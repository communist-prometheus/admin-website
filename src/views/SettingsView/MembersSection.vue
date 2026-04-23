<script setup lang="ts">
import InviteDialog from './InviteDialog.vue'
import InviteList from './InviteList.vue'
import MemberList from './MemberList.vue'
import { useMembersSection } from './useMembersSection'

const s = useMembersSection()
</script>

<template>
  <section class="members-section" data-testid="members-section">
    <header class="head">
      <h2>Members</h2>
      <button
        v-if="s.canEditSettings.value"
        type="button"
        class="btn-invite"
        data-testid="invite-open"
        :disabled="s.busy.value"
        @click="s.openDialog"
      >
        + Invite
      </button>
    </header>
    <p v-if="s.loading.value" class="hint">Loading organisation members…</p>
    <InviteList
      v-if="s.invitations.value.length > 0"
      :invitations="s.invitations.value"
      :disabled="s.disabled.value"
      @revoke="s.onRevoke"
    />
    <p
      v-if="
        !s.loading.value &&
        s.sorted.value.length === 0 &&
        s.invitations.value.length === 0
      "
      class="hint"
      data-testid="members-empty"
    >
      No GitHub organisation members visible. The OAuth token may lack
      read:org, or the organisation is empty.
    </p>
    <MemberList
      v-if="s.sorted.value.length > 0"
      :rows="s.sorted.value"
      :disabled="s.disabled.value"
      @change="s.onRoleChange"
    />
    <p
      v-if="!s.canEditSettings.value && s.sorted.value.length > 0"
      class="hint read-only"
    >
      Read-only — your role does not allow changes.
    </p>
    <InviteDialog
      :open="s.dialogOpen.value"
      :busy="s.busy.value"
      @submit="s.onInvite"
      @cancel="s.closeDialog"
    />
  </section>
</template>

<style scoped>
.members-section {
  margin-bottom: 2rem;
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

h2 {
  font-size: 1.25rem;
  margin: 0;
}

.btn-invite {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--color-accent);
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-invite:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.hint {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.read-only {
  margin-top: 0.5rem;
  font-style: italic;
}
</style>
