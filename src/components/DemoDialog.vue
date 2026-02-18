<script setup lang="ts">
import { ref } from 'vue'

const dialogRef = ref<HTMLDialogElement | null>(null)

const open = () => {
  dialogRef.value?.showModal()
}

const close = () => {
  dialogRef.value?.close()
}

const handleSubmit = (event: Event) => {
  event.preventDefault()
  const formData = new FormData(event.target as HTMLFormElement)
  const data = Object.fromEntries(formData.entries())
  console.log('Form submitted:', data)
  close()
}

defineExpose({ open, close })
</script>

<template>
  <dialog ref="dialogRef" :style="{ 
    padding: '2rem',
    borderRadius: '8px',
    border: '1px solid var(--color-border)',
    maxWidth: '500px',
    width: '90vw'
  }">
    <form method="dialog" @submit="handleSubmit">
      <h2 :style="{ marginTop: 0 }">Demo Dialog</h2>
      
      <div :style="{ marginBottom: '1rem' }">
        <label for="name" :style="{ display: 'block', marginBottom: '0.5rem' }">
          Name:
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          :style="{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)'
          }"
        />
      </div>

      <div :style="{ marginBottom: '1rem' }">
        <label for="email" :style="{ display: 'block', marginBottom: '0.5rem' }">
          Email:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          :style="{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)'
          }"
        />
      </div>

      <div :style="{ marginBottom: '1rem' }">
        <label for="message" :style="{ display: 'block', marginBottom: '0.5rem' }">
          Message:
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          :style="{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            fontFamily: 'inherit'
          }"
        />
      </div>

      <div :style="{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }">
        <button
          type="button"
          @click="close"
          :style="{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: '1px solid var(--color-border)',
            background: 'transparent',
            cursor: 'pointer'
          }"
        >
          Cancel
        </button>
        <button
          type="submit"
          :style="{
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            border: 'none',
            background: '#42b883',
            color: 'white',
            cursor: 'pointer'
          }"
        >
          Submit
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
}
</style>
