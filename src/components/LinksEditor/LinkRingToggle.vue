<script setup lang="ts">
defineProps<{ readonly checked: boolean }>()

const emit = defineEmits<{ change: [value: boolean] }>()

const onChange = (e: Event): void => {
  if (e.target instanceof HTMLInputElement) emit('change', e.target.checked)
}
</script>

<template>
  <label class="f-ring">
    <input
      type="checkbox"
      :checked="checked"
      data-testid="link-inring"
      @change="onChange"
    />
    ring
  </label>
</template>

<style scoped>
.f-ring {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
