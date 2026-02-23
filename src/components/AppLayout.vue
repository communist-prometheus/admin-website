<script setup lang="ts">
</script>

<template>
  <div
    :style="{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }"
  >
    <header
      :style="{ 
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-background)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }"
    >
      <div :style="{ fontSize: '1.5rem', fontWeight: '600' }">
        Admin Panel
      </div>
      <slot name="header-actions"></slot>
    </header>

    <main
      :style="{ 
        flex: '1',
        padding: '2rem'
      }"
    >
      <slot></slot>
    </main>

    <footer
      :style="{ 
        padding: '1.5rem 2rem',
        borderTop: '1px solid var(--color-border)',
        background: 'var(--color-background-mute)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.875rem'
      }"
    >
      <slot name="footer">
        © {{ new Date().getFullYear() }} Admin Panel. All rights reserved.
      </slot>
    </footer>
  </div>
</template>
