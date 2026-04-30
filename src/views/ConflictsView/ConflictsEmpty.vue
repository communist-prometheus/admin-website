<script setup lang="ts">
import { CONFLICT_TEST_IDS } from './test-ids'
</script>

<template>
  <p class="empty" :data-testid="CONFLICT_TEST_IDS.empty">
    No active conflicts.
  </p>
</template>

<style scoped>
.empty {
  color: var(--color-text-muted, #888);
}
</style>
