<script setup lang="ts">
interface Props {
  src: string
  alt: string
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  size: 'md',
})
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :data-size="size"
  />
</template>

<style scoped>
:host {
  & img {
    border-radius: var(--radius-full);
    object-fit: cover;
    
    &[data-size='sm'] {
      width: var(--size-avatar-sm);
      height: var(--size-avatar-sm);
    }
    
    &[data-size='md'] {
      width: var(--size-avatar-md);
      height: var(--size-avatar-md);
    }
    
    &[data-size='lg'] {
      width: var(--size-avatar-lg);
      height: var(--size-avatar-lg);
    }
  }
}
</style>
