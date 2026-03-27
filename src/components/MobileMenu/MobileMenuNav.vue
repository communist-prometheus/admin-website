<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import MobileAuthAction from './MobileAuthAction.vue'
import MobileNavLink from './MobileNavLink.vue'
import { visibleItems } from './visible-items'

const emit = defineEmits<{
  navigate: []
}>()

const auth = useAuthStore()
const items = computed(() =>
  visibleItems(!!auth.user)
)
</script>

<template>
  <ul class="mobile-nav-list">
    <MobileNavLink
      v-for="item in items"
      :key="item.path"
      :path="item.path"
      :label="item.label"
      @click="emit('navigate')"
    />
    <MobileAuthAction @navigate="emit('navigate')" />
  </ul>
</template>

<style scoped>
.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}
</style>
