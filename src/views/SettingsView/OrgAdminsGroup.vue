<script setup lang="ts">
import OrgAdminsList from './OrgAdminsList.vue'

defineProps<{
  readonly admins: readonly string[]
  readonly loading: boolean
}>()
</script>

<template>
  <section class="org-admins" data-testid="org-admins-group">
    <h3>Admins (GitHub org)</h3>
    <p v-if="loading" class="hint">
      Loading GitHub organisation admins…
    </p>
    <p v-else-if="admins.length === 0" class="hint">
      No GitHub-org admins found. The OAuth token may lack
      <code>read:org</code> or the organisation has no admins yet.
    </p>
    <OrgAdminsList v-else :admins="admins" />
  </section>
</template>

<style scoped>
.org-admins {
  margin-bottom: 1rem;
}

h3 {
  font-size: 1rem;
  margin: 0 0 0.5rem;
}

.hint {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}
</style>
