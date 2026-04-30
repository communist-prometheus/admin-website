<script setup lang="ts">
import { CONFLICT_TEST_IDS } from './test-ids'

defineEmits<{ readonly finalize: [] }>()
</script>

<template>
  <button
    type="button"
    class="finalize"
    :data-testid="CONFLICT_TEST_IDS.finalize"
    @click="$emit('finalize')"
  >
    Commit + push merged result
  </button>
</template>

<style scoped>
.finalize {
  align-self: flex-start;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 8px 14px;
  border: 0;
  border-radius: 4px;
  background: var(--color-accent, #4fc3f7);
  color: #fff;
  cursor: pointer;
}
</style>
