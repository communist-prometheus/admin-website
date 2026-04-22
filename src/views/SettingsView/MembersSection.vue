<script setup lang="ts">
import { onMounted } from 'vue'
import type { Role, RolesConfig } from '@/types/role'
import MemberAddForm from './MemberAddForm.vue'
import MemberRoleGroup from './MemberRoleGroup.vue'
import OrgAdminsGroup from './OrgAdminsGroup.vue'
import { useOrgAdmins } from './useOrgAdmins'
import { useRolesConfig } from './useRolesConfig'

const { config, loading, saving, load, save } = useRolesConfig()
const org = useOrgAdmins()
onMounted(() => {
  void load()
  void org.load()
})

const addMember = async (username: string, role: Role) => {
  const roles = { ...config.value.roles }
  const list = [...roles[role]]
  if (!list.includes(username)) list.push(username)
  roles[role] = list
  await save({ roles } as RolesConfig)
}

const removeMember = async (role: Role, username: string) => {
  const roles = { ...config.value.roles }
  roles[role] = roles[role].filter(u => u !== username)
  await save({ roles } as RolesConfig)
}
</script>

<template>
  <section class="members-section">
    <h2>Members</h2>
    <OrgAdminsGroup :admins="org.admins.value" :loading="org.loading.value" />
    <p v-if="loading" class="loading">
      Loading members...
    </p>
    <MemberRoleGroup
      v-for="role in (['admin', 'chief-editor', 'editor'] as const)"
      :key="role"
      :role="role"
      :members="config.roles[role]"
      :saving="saving"
      @remove="removeMember(role, $event)"
    />
    <MemberAddForm :disabled="saving" @add="addMember" />
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

.loading {
  color: var(--color-text-secondary);
}
</style>
