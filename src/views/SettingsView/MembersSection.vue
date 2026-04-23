<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { usePermissions } from '@/composables/usePermissions'
import type { Role } from '@/types/role'
import { applyRoleChange } from './apply-role-change'
import MemberList from './MemberList.vue'
import { mergeMembers } from './merge-members'
import { useOrgMembers } from './useOrgMembers'
import { useRolesConfig } from './useRolesConfig'

const { config, loading: rolesLoading, saving, load, save } = useRolesConfig()
const org = useOrgMembers()
const { canEditSettings } = usePermissions()

onMounted(() => {
  void load()
  void org.load()
})

const rows = computed(() => mergeMembers(org.members.value, config.value))
const isLoading = computed(() => rolesLoading.value || org.loading.value)
const controlsDisabled = computed(
  () => saving.value || !canEditSettings.value
)

const onRoleChange = async (login: string, role: Role | undefined) => {
  await save(applyRoleChange(config.value, login, role))
}
</script>

<template>
  <section class="members-section" data-testid="members-section">
    <h2>Members</h2>
    <p v-if="isLoading" class="hint">Loading organisation members…</p>
    <p
      v-else-if="rows.length === 0"
      class="hint"
      data-testid="members-empty"
    >
      No GitHub organisation members visible. The OAuth token may lack
      read:org, or the organisation is empty.
    </p>
    <MemberList
      v-else
      :rows="rows"
      :disabled="controlsDisabled"
      @change="onRoleChange"
    />
    <p v-if="!canEditSettings && rows.length > 0" class="hint read-only">
      Read-only — your role does not allow role changes.
    </p>
  </section>
</template>

<style scoped>
.members-section {
  margin-bottom: 2rem;
}

h2 {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
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
