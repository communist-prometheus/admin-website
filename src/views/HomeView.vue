<script setup lang="ts">
import { ref } from 'vue'
import TheWelcome from '../components/TheWelcome.vue'
import DemoDialog from '../components/DemoDialog.vue'

const demoDialogRef = ref<InstanceType<typeof DemoDialog> | null>(null)

const openDialog = () => {
  demoDialogRef.value?.open()
}
</script>

<template>
  <main>
    <div :style="{ marginBottom: '2rem' }">
      <button
        @click="openDialog"
        :style="{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          borderRadius: '8px',
          border: 'none',
          background: '#42b883',
          color: 'white',
          cursor: 'pointer',
          fontWeight: '500'
        }"
      >
        Open Demo Dialog
      </button>
    </div>
    
    <TheWelcome />
    
    <DemoDialog ref="demoDialogRef" />
  </main>
</template>
